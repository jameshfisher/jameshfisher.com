---
title: How do I generate assembly from a C file?
tags:
  - c
  - assembly
  - programming
taggedAt: '2024-03-26'
---

Any C compiler has multiple stages. A fundamental one is _assembler_. The compiler runs the C preprocessor, parses the C file, and transforms that AST into assembler. Usually, we instruct the compiler to then _assemble_ that into an object file and link it, producing a binary.

If we want to see the assembly, we pass `-S` to the compiler. Take the C file:

```c
int main(void) {
  return 0;
}
```

We ordinarily compile and run this with:

```
% cc main.c
% ./a.out
```

But we can generate assembler instead:

```
% cc -S main.c
```

This gives us the file:

```s
	.section	__TEXT,__text,regular,pure_instructions
	.macosx_version_min 10, 12
	.globl	_main
	.align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## BB#0:
	pushq	%rbp
Ltmp0:
	.cfi_def_cfa_offset 16
Ltmp1:
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
Ltmp2:
	.cfi_def_cfa_register %rbp
	xorl	%eax, %eax
	movl	$0, -4(%rbp)
	popq	%rbp
	retq
	.cfi_endproc


.subsections_via_symbols
```
