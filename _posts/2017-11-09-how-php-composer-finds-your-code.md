---
title: "How PHP and Composer find your code"
---

[Recently I showed how to create an empty Packagist package]({% post_url 2017-11-06-how-to-release-a-composer-package %}).
By "empty", I mean it doesn't contain any code.
This is useless, so let's start adding some code.

The package is `jameshfisher/donut-logic`,
which is on Packagist.org at <https://packagist.org/packages/jameshfisher/donut-logic>.
The package is backed by a Git repository at <https://github.com/jameshfisher/donut-logic>.
To add the package as a dependency of your project, run

```sh
$ ./composer.phar require jameshfisher/donut-logic
```

This adds `jameshfisher/donut-logic` to your `composer.json`,
and puts the contents of the package under `vendor/jameshfisher/donut-logic/`.
I want to add some code to this package so that,
from my project, I can use it as follows:

```php
echo(\Jim\DonutLogic\DonutAdder::addDonuts(2, 3));  // prints "O"
```

In the above,
`\Jim\DonutLogic` is a namespace name,
`DonutAdder` is a class name,
and `addDonuts` is a static method on that class.

When your code makes this call,
how does PHP find the implementation of `\Jim\DonutLogic\DonutAdder::addDonuts`?
The standard answer is:
you must have defined it before you call it.
You can define `addDonuts` in the lines above the method call,
but this can't work for things defined in other packages.
Instead, you use `include`/`require`/`require_once`,
which, given a filename, load the file as PHP.
Just ensure that you've included the file which defines `\Jim\DonutLogic\DonutAdder::addDonuts`
before you call it.
Using Composer,
you include the file by including your project's `vendor/autoload.php`:

```php
require __DIR__ . '/vendor/autoload.php';
echo(\Jim\DonutLogic\DonutAdder::addDonuts(2, 3));  // prints "O"
```

The `autoload.php` could work by `include`ing all of your dependencies' source files.
However, this is not how modern PHP works!
Instead, modern PHP uses a PHP feature called "autoloading".
At runtime, when PHP encounters the use of a class which has not been defined,
it delegates the loading to an "autoloader".
An autoloader is a standard PHP function
which is passed the name of a class,
and is expected to somehow define that class.
You can register your autoloader with
[`spl_autoload_register($my_autoloader_func)`](http://php.net/manual/en/function.spl-autoload-register.php).
There can be many autoloaders.

When our PHP requests to use `\Jim\DonutLogic\DonutAdder`,
PHP realizes it's not defined, and asks the autoloaders to define it.
There are lots of ways the autoloaders could do this, which would be chaos.
To avoid such chaos, the PHP community have defined [PSR-4](http://www.php-fig.org/psr/psr-4/),
which says how an autoloader should find a file based on a class name.
One implementation of PSR-4 is Composer's autoloader,
and that's what `vendor/autoload.php` defines.

PSR-4 says that the class `DonutAdder` must be in a file `DonutAdder.php`.
We'll put the source file `DonutAdder.php` in our package source repository at `src/DonutAdder.php`,
so that Composer will install it at `vendor/jameshfisher/donut-logic/src/DonutAdder.php`.
Then we must arrange for Composer's autoloader to find the file at that location.
PSR-4 says that the file will be found in a directory determined by two things:
the namespace (`\Jim\DonutLogic`),
and a mapping from namespace prefixes to "base directories".
In our case, the namespace prefix `\Jim\DonutLogic`
must be mapped to the directory `vendor/jameshfisher/donut-logic/src`.

Composer's prefix-to-directory mapping is defined by dependencies' `composer.json` files.
I must extend the `donut-logic` package's `composer.json` as follows:

```json
{
    "name": "jameshfisher/donut-logic",
    "description": "Shared logic related to donuts",
    "require": {},
    "autoload": {
        "psr-4": {"Jim\\DonutLogic\\": "src/"}
    }
}
```

In `src/DonutAdder.php`, we define the `\Jim\DonutLogic\DonutAdder` class:

```php
<?php
namespace Jim\DonutLogic;
class DonutAdder {
  public static function addDonuts($a, $b) {
    return "O";
  }
}
```

In my example project, after a `./composer.phar update`,
the following code works:

```php
require __DIR__ . '/vendor/autoload.php';
echo(\Jim\DonutLogic\DonutAdder::addDonuts(2, 3));  // prints "O"
```
