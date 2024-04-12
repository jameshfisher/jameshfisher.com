---
title: "Shape typing in Python"
tags: ["python", "types", "programming"]
---

While I was looking the other way,
Python got advanced static types!
Here's matrix multiplication,
describing the input shapes and its output shape:

```python
def mat_mul[
    N, K, M
](
  m1: Mat[N, M],
  m2: Mat[M, K],
) -> Mat[N, K]:
    return m1 @ m2
```

There's a lot going on here!
In traditional Python, we'd write:

```python
def mat_mul(m1, m2):
    return m1 @ m2
```

Then if we used the wrong shapes,
we'd get a runtime error,
like this:

```
>>> m1 @ m2
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: matmul: Input operand 1 has a mismatch
  in its core dimension 0, with gufunc signature
  (n?,k),(k,m?)->(n?,m?) (size 2 is different from 3)
```

Our type-safe wrapper `mat_mul` uses a type `Mat[N, M]`,
which I defined as:

```python
type Mat[N, M] = np.ndarray[
    tuple[N, M],
    np.dtype[np.float64],
]
```

If we try to multiply matrices of the wrong shape,
[Pyright](https://github.com/microsoft/pyright) gives a type error.

This uses Numpy's `np.ndarray` type,
which takes two arguments
that describe the shape and dtype.
For example, we can describe a 2x3 matrix of integers as:

```python
mat2x3: np.ndarray[
    tuple[Literal[2], Literal[3]],
    np.dtype[np.int64],
] = np.array([[1,2,3],[4,5,6]])
```

At the moment, most of the numpy API does not use these type parameters.
For example, `np.array(...)` just gives you an `np.ndarray[Any, Any]`.
So we have to make our own type-safe wrappers.
