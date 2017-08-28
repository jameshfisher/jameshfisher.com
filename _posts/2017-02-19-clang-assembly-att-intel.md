---
title: "How to generate Intel and AT&T assembly with `clang`"
---

Earlier I showed [how to generate assembly from C]({% post_url 2017-02-03-c-generate-assembly %}). We compile this file with `clang -S`:

```c
int main(void) {
  return 0;
}
```

We get the following file, `main.s`:

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

This file is assembly in "AT&T syntax". Annoyingly, there are two branches of assembly syntax. The other is "Intel syntax", and we can get `clang` to generate this instead with `-masm=intel`:

```
	.section	__TEXT,__text,regular,pure_instructions
	.macosx_version_min 10, 12
	.intel_syntax noprefix
	.globl	_main
	.align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## BB#0:
	push	rbp
Ltmp0:
	.cfi_def_cfa_offset 16
Ltmp1:
	.cfi_offset rbp, -16
	mov	rbp, rsp
Ltmp2:
	.cfi_def_cfa_register rbp
	xor	eax, eax
	mov	dword ptr [rbp - 4], 0
	pop	rbp
	ret
	.cfi_endproc


.subsections_via_symbols
```
