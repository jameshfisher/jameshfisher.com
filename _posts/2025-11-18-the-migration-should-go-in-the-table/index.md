---
title: "The migration SQL should go in the table"
tags: ["programming"]
---

So you run `migrate` in your dev environment, but it fails:
some unknown migration `add-foobar` has already been applied from some other experimental branch,
and the migration tool doesn't know how to down-migrate it.
To fix it, you have to hunt for the branch that created that migration,
to find its down-migration SQL.
Hopefully you still have that migration!

I want `migrate` to always get me to my desired database schema,
no matter what the current migration list looks like.
But no migration tools today have this property:
they always need a developer in the loop
to find the down-migration SQL.

Say the database has applied migrations _a → b → c_,
but we want _a → b → d_.
Then `migrate` needs to run the down-migration for _c_, then run the up-migration for _d_.
This means `migrate` may need the down-migration SQL for any migration that has been applied.
We can guarantee this by storing the down-migration in the `migrations` table:

```
id  name         down_sql
==  ===========  ====================================
0   users-table  drop table users;
1   email-col    alter table users drop column email;
```

All other migration tools I know of have a `migrations` table,
but they only store a list of migration names.
They assume you have the migration code checked out for the _current_ database schema.
This is a bad assumption, even for your production database!
Say a bad migration gets applied to your production database.
You should be able to roll back in the normal way: revert the commit and redeploy.
But with standard migration tools, this can't work:
the down-migration SQL is lost in the revert!
