---
title: "macOS system calls"
---

My machine runs macOS 10.12. macOS is a BSD system. Let's see what facilities this OS provides to processes. We'll do so with a rough categorization of its system calls. We can see all man pages with `man -k .`, and filter to the system call pages with `grep '(2)'`. I did this and then roughly grouped the system calls by the thing they operate on. It's probably inaccurate in places; I'll update it as my knowledge improves.


## Users, groups

```
getlogin(2), setlogin(2) - get/set login name
pthread_setugid_np(2)    - Set the per-thread userid and single groupid
setregid(2)              - set real and effective group ID
setreuid(2)              - set real and effective user IDs
geteuid(2), getuid(2)    - get user identification
getegid(2), getgid(2)    - get group process identification
```


## Processes

```
execve(2)                - execute a file
fork(2)                  - create a new process
vfork(2)                 - spawn new process in a virtual memory efficient way
_exit(2)                 - terminate the calling process
acct(2)                  - enable or disable process accounting
getpid(2), getppid(2)    - get parent or calling process identification
getsid(2)                - get process session
issetugid(2)             - is current process tainted by uid or gid changes
wait(2), wait3(2), wait4(2), waitpid(2) - wait for process termination
posix_spawn(2), posix_spawn posix_spawnp(2) - spawn a process
```

## Process groups

```
getpgid(2), getpgrp(2)   - get process group
setpgid(2), setpgrp(2)   - set process group
setsid(2)                - create session and set process group ID
setegid(2), seteuid(2), setgid(2), setuid(2) - set user and group ID
```

## Reading and writing

```
pread(2), read(2), readv(2) - read input
pwrite(2), write(2), writev(2) - write output
```


## Multiplexing

```
poll(2)                  - synchronous I/O multiplexing
pselect(2)               - synchronous I/O multiplexing a la POSIX.1g
```


## Signals

```
sigaction(2)             - software signal facilities
sigaltstack(2)           - set and/or get signal stack context
sigblock(2)              - block signals
sigpause(2)              - atomically release blocked signals and wait for interrupt
sigpending(2)            - get pending signals
sigprocmask(2)           - manipulate current signal mask
sigsetmask(2)            - set current signal mask
sigstack(2)              - set and/or get signal stack context
sigsuspend(2)            - atomically release blocked signals and wait for interrupt
sigvec(2)                - software signal facilities
sigwait(2)               - select a set of signals
kill(2)                  - send signal to a process
killpg(2)                - send signal to a process group
pthread_kill(2)          - send a signal to a specified thread
pthread_sigmask(2)       - examine and/or change a thread's signal mask
```


## Descriptors

```
close(2)                 - delete a descriptor
dup(2), dup2(2)          - duplicate an existing file descriptor
getdtablesize(2)         - get descriptor table size
i386_get_ldt(2), i386_set_ldt(2) - manage i386 per-process Local Descriptor Table entries
```


## Pipes (simple!)

```
pipe(2)                  - create descriptor pair for interprocess communication
mkfifo(2)                - make a fifo file
```


## Sockets

```
accept(2)                - accept a connection on a socket
bind(2)                  - bind a name to a socket
connect(2)               - initiate a connection on a socket
connectx(2)              - initiate a connection on a socket
disconnectx(2)           - disconnects a connection on a socket
getsockname(2)           - get socket name
getsockopt(2), setsockopt(2) - get and set options on sockets
listen(2)                - listen for connections on a socket
recv(2), recvfrom(2), recvmsg(2) - receive a message from a socket
send(2), sendmsg(2), sendto(2) - send a message from a socket
sendfile(2)              - send a file to a socket
socket(2)                - create an endpoint for communication
socketpair(2)            - create a pair of connected sockets
shutdown(2)              - shut down part of a full-duplex connection
getpeername(2)           - get address of connected peer
```



## File ownership/permissions

```
chflags(2), fchflags(2)  - set file flags
chmod(2), fchmod(2), fchmodat(2) - change mode of file
chown(2), fchown(2), lchown(2), fchownat(2) - change owner and group of a file
```


## File links (hard links / symlinks)

```
link(2), linkat(2)       - make a hard file link
unlink(2), unlinkat(2)   - remove directory entry
symlink(2), symlinkat(2) - make symbolic link to a file
readlink(2), readlinkat(2) - read value of a symbolic link
```


## Time

```
adjtime(2)               - correct the time to allow synchronization of the system clock
getitimer(2), setitimer(2) - get/set value of interval timer
gettimeofday(2), settimeofday(2) - get/set date and time
nanosleep(2)             - suspend thread execution for an interval measured in nanoseconds
```


## Asynchronous I/O

```
aio_cancel(2)            - cancel an outstanding asynchronous I/O operation (REALTIME)
aio_error(2)             - retrieve error status of asynchronous I/O operation (REALTIME)
aio_read(2)              - asynchronous read from a file (REALTIME)
aio_return(2)            - retrieve return status of asynchronous I/O operation (REALTIME)
aio_suspend(2)           - suspend until asynchronous I/O operations or timeout complete (REALTIME)
aio_write(2)             - asynchronous write to a file (REALTIME)
```


## Filesystems

```
mount(2), unmount(2)     - mount or dismount a filesystem
quotactl(2)              - manipulate filesystem quotas
setattrlist(2), fsetattrlist(2) - set file system attributes
statfs(2), statfs64(2), fstatfs(2), fstatfs64(2) - get file system statistics
getfsstat(2)             - get list of all mounted file systems
getattrlist(2), fgetattrlist(2), getattrlistat(2) - get file system attributes
getattrlistbulk(2)       - get file system attributes for multiple directory entries
getdirentriesattr(2), getdirentriesattr(NOW DEPRECATED)(2) - get file system attributes for multiple directory entries
searchfs(2)              - search a volume quickly
```


## Network File System (NFS)

```
nfsclnt(2)               - NFS client services
nfssvc(2)                - NFS services
```


## Files

```
creat(2)                 - create a new file
access(2), faccessat(2)  - check accessibility of a file
clonefile(2)             - create copy on write clones of files
open(2), openat(2)       - open or create a file for reading or writing
exchangedata(2)          - atomically exchange data between two files
fcntl(2)                 - file control
fhopen(2)                - open a file by file handle
flock(2)                 - apply or remove an advisory lock on an open file
getfh(2)                 - get file handle
fstat(2), fstat64(2), lstat(2), lstat64(2), stat(2), stat64(2), fstatat(2) - get file status
fsync(2)                 - synchronize a file's in-core state with that on disk
ftruncate(2), truncate(2) - truncate or extend a file to a specified length
futimes(2), utimes(2)    - set file access and modification times
lseek(2)                 - reposition read/write file offset
mknod(2)                 - make a special file node
rename(2), renameat(2), renamex_np(2), renameatx_np(2) - change the name of a file
revoke(2)                - revoke file access
sync(2)                  - synchronize disk block in-core status with that on disk
umask(2)                 - set file creation mode mask
undelete(2)              - attempt to recover a deleted file
```


## Directories

```
getdirentries(2)         - get directory entries in a filesystem independent format
mkdir(2), mkdirat(2)     - make a directory file
rmdir(2)                 - remove a directory file
chdir(2), fchdir(2)      - change current working directory
chroot(2)                - change root directory
```


## Memory

```
mmap(2)                  - allocate memory, or map files or devices into memory
mincore(2)               - determine residency of memory pages
minherit(2)              - control the inheritance of pages
mlock(2), munlock(2)     - lock (unlock) physical pages in memory
mprotect(2)              - control the protection of pages
msync(2)                 - synchronize a mapped region
munmap(2)                - remove a mapping
brk(2), sbrk(2)          - change data segment size
madvise(2), posix_madvise(2) - give advice about use of memory
```


## Shared memory

```
shm_open(2)              - open a shared memory object
shm_unlink(2)            - remove shared memory object
shmat(2), shmdt(2)       - map/unmap shared memory
shmctl(2)                - shared memory control operations
shmget(2)                - get shared memory area identifier
```


## Semaphores

```
sem_close(2)             - close a named semaphore
sem_open(2)              - initialize and open a named semaphore
sem_post(2)              - unlock a semaphore
sem_trywait(2), sem_wait(2) - lock a semaphore
sem_unlink(2)            - remove a named semaphore
semctl(2)                - control operations on a semaphore set
semget(2)                - obtain a semaphore id
semop(2)                 - atomic array of operations on a semaphore set
```


## Kqueue

```
kqueue(2), kevent(2), kevent64(2) - and kevent_qos kernel event notification mechanism
```


## Tracing/profiling/debugging

```
profil(2)                - control process profiling
ptrace(2)                - process tracing and debugging
```


## Audit

```
setaudit_addr(2), setaudit(NOW DEPRECATED)(2) - set audit session state
getauid(2)               - retrieve audit user ID
setauid(2)               - set audit indentifier
audit(2)                 - commit BSM audit record to audit log
auditctl(2)              - configure system audit parameters
auditon(2)               - configure system audit parameters
getaudit_addr(2), getaudit(NOW DEPRECATED)(2) - retrieve audit session state
```


## Things I don't know anything about

```
listxattr(2), flistxattr(2) - list extended attribute names
reboot(2)                - reboot system or halt processor
removexattr(2), fremovexattr(2) - remove an extended attribute value
setgroups(2)             - set group access list
setxattr(2), fsetxattr(2) - set an extended attribute value
au_bsm_to_fcntl_cmd(3), au_fcntl_cmd_to_bsm(3) - convert between BSM and local fcntl(2) command values
fpathconf(2), pathconf(2) - get configurable pathname variables
getentropy(2)            - get entropy
getgroups(2)             - get group access list
gethostuuid(2)           - return a unique identifier for the current machine
getpriority(2), setpriority(2) - get/set program scheduling priority
getrlimit(2), setrlimit(2) - control maximum system resource consumption
getrusage(2)             - get information about resource utilization
getxattr(2), fgetxattr(2) - get an extended attribute value
ioctl(2)                 - control device
```
