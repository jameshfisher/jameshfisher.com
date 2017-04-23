---
title: "A TCP chat server in 55 lines of Golang"
---

The go `net` package lets you write a TCP server. Here's a chat server, where every byte sent by a client is copied to every other client (including the sender).

```go
package main
import "net"
func main() {
  newConns := make(chan net.Conn, 128)
  deadConns := make(chan net.Conn, 128)
  publishes := make(chan []byte, 128)
  conns := make(map[net.Conn]bool)
	listener, err := net.Listen("tcp", ":8080")
	if err != nil { panic(err) }
	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil { panic(err) }
			newConns <- conn
		}
	}()
	for {
		select {
		case conn := <-newConns:
			conns[conn] = true
			go func() {
				buf := make([]byte, 1024)
				for {
					nbyte, err := conn.Read(buf)
					if err != nil {
						deadConns <- conn
						break
					} else {
						fragment := make([]byte, nbyte)
						copy(fragment, buf[:nbyte])
						publishes <- fragment
					}
				}
			}()
		case deadConn := <-deadConns:
			_ = deadConn.Close()
			delete(conns, deadConn)
		case publish := <-publishes:
			for conn, _ := range conns {
				go func(conn net.Conn) {
					totalWritten := 0
					for totalWritten < len(publish) {
						writtenThisCall, err := conn.Write(publish[totalWritten:])
						if err != nil {
							deadConns <- conn
							break
						}
						totalWritten += writtenThisCall
					}
				}(conn)
			}
		}
	}
	listener.Close()
}
```

Compare this to C:

* `net.Listen` does the `socket`, `bind`, and `listen` syscalls.
* Instead of raw file descriptors, we get `net.Listener` and `net.Conn` objects.
* The go runtime manages multiple goroutines, each making blocking syscalls like `conn.Read`, and multiplexes them onto a single process, ensuring that those goroutines don't block each other. `dtruss` suggests Go is using `select` and `kqueue` for this on my machine.
