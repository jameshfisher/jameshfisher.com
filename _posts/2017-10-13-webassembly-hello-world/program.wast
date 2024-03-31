(module
  (func $log (import "imports" "log") (param i32))
  (func (export "e")
    i32.const 42
    call $log))
