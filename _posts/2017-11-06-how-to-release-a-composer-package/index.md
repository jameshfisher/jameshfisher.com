---
title: How do I release a PHP Composer package?
justification: I'm learning this for work
tags:
  - php
  - composer
  - package-management
  - programming
taggedAt: '2024-03-26'
summary: >-
  To release a PHP Composer package, create a GitHub repo, add a `composer.json`
  file, submit the package to Packagist.org, and tag a stable version. Then
  Composer users can require your package.
---

[Composer](https://getcomposer.org/)
is the standard package manager for PHP.
Here's how to release a package for it.

First let's clarify what I'm doing.
I have an example project called `donut-news`,
and its `composer.json` looks like this:

```json
{
    "name": "jameshfisher/donut-news",
    "description": "Donut news",
    "type": "project",
    "authors": [
        {
            "name": "Jim Fisher",
            "email": "jameshfisher@gmail.com"
        }
    ],
    "require": {
        "monolog/monolog": "^1.23"
    }
}
```

The `require` block defines the dependencies for `jameshfisher/donut-news`,
and currently it has one dependency:
`monolog`, a logging library.
This dependency was added by running:

```bash
php composer.phar require monolog/monolog
```

Now `donut-news` has a lot of donut logic
which would be better put in a generic `donuts` library.
I want to create a new Composer library package called `donut-logic`,
so that I can add it  to my `donut-news` project by running

```bash
php composer.phar require jameshfisher/donut-logic
```

When you run `php composer.phar require foo/bar`,
Composer looks for the package `foo/bar` in _repositories_.
A repository is a store of Composer packages.
The default Composer repository is `https://packagist.org`,
and [you can browse all the packages on Packagist.org here](https://packagist.org/explore/).
To release `jameshfisher/donut-logic`,
I need to get it into this list.

Composer package names are prefixed with a "vendor" name.
In `jameshfisher/donut-logic`,
the vendor is `jameshfisher`.
On Packagist.org,
vendor names correspond to accounts.
I created an account on Packagist.org called `jameshfisher`.

Packages on Packagist.org are backed by git repositories.
I created a new repository at <https://github.com/jameshfisher/donut-logic>.

Just like your PHP projects have a `composer.json`,
Composer packages/libraries also have a `composer.json`.
I created this `composer.json` for `donut-logic`,
and [added it to the root of the repository](https://github.com/jameshfisher/donut-logic/blob/master/composer.json):

```json
{
    "name": "jameshfisher/donut-logic",
    "description": "Shared logic related to donuts",
    "require": {}
}
```

Next, I visited <https://packagist.org/packages/submit>,
which asks for the repository URL.
I submitted it, and it registed a new Packagist.org package:
<https://packagist.org/packages/jameshfisher/donut-logic>.
However, this new package is not "stable",
so can't be installed by default!:

```
$ php composer.phar require jameshfisher/donut-logic

  [InvalidArgumentException]
  Could not find package jameshfisher/donut-logic at any version for your m
  inimum-stability (stable). Check the package spelling or your minimum-sta
  bility
```

It turns out that "stable" means "has a git tag".
So I tagged my current version as `0.0.1`:

```
$ git tag 0.0.1
$ git push --tags
Total 0 (delta 0), reused 0 (delta 0)
To github.com:jameshfisher/donut-logic.git
 * [new tag]         0.0.1 -> 0.0.1
```

This isn't enough, because
Packagist.org doesn't know that I've updated the source git repository.
I need to tell it that the repository has been updated:

```
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"repository":{"url":"https://github.com/jameshfisher/donut-logic"}}' \
  'https://packagist.org/api/update-package?username=jameshfisher&apiToken=MY_API_TOKEN'
```

(I got my Packagist.org API token at <https://packagist.org/profile/>.)
Now at <https://packagist.org/packages/jameshfisher/donut-logic>
I can see that there are two versions of my package: `dev-master` and `0.0.1`.
I can now `require` my package, and it gets version `0.0.1`:

```
$ php composer.phar require jameshfisher/donut-logic
Using version ^0.0.1 for jameshfisher/donut-logic
./composer.json has been updated
Loading composer repositories with package information
Updating dependencies (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing jameshfisher/donut-logic (0.0.1): Downloading (100%)
Writing lock file
Generating autoload files
```

There's a more reliable way to ensure that
Packagist.org is up-to-date with the source git repo:
GitHub Service Hooks.
I went to <https://github.com/jameshfisher/donut-logic/settings/hooks/new?service=packagist>,
and configured it with my username and Packagist.org API token.
Now, when my repository is updated,
GitHub will notify Packagist.org.
