TODO

C var-args gives us the `...` syntax to declare functions with variable argument length, gives us the type `va_list` to represent such variable-argument lists, and gives us three macros to manipulate them: `va_start` to get access to the list, `va_arg` to iterate through the list, and `va_end` to finish iterating.

How is this implemented? Can we do it ourselves?
