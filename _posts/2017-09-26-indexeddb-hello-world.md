---
title: "IndexedDB hello world"
---

IndexedDB is one kind of storage provided by browsers,
alongside cookies, LocalStorage, and AppCache.
You may have heard that IndexedDB is a key-value store.
This may fool you into thinking that the IndexedDB API is similar to LocalStorage,
which does not have much more than `getItem` and `putItem`.
No! Compared to LocalStorage, IndexedDB has many additional concepts:
multiple DBs, multiple "object stores", indexes, primary keys, DB upgrades, transactions.
Consequently, the "hello world" is pretty long.

This page has created a database called `"testdb"`,
which has one table called `"employees"`.
You can see this in Chrome by opening Developer Tools, going to Application, then IndexedDB.

The following form sets/gets values in the `localStorage` for this website (`jameshfisher.com`).

<div>
  <input type="text" id="key" value="Jim"/>
  <input type="text" id="value" value='{"name": "Jim", "position": "CEO"}'/>
  <input type="button" id="get" value="Get"/>
  <input type="button" id="put" value="Put"/>
</div>

<script>
  let db;
  const req = indexedDB.open("exampledb", 1);
  req.addEventListener("upgradeneeded", function (ev) {
    const db = req.result;
    db.createObjectStore("employees", { keyPath: "name" });
  });
  req.addEventListener("success", function () {
    db = req.result;
    const keyEl = document.getElementById("key");
    const valEl = document.getElementById("value");
    document.getElementById("get").addEventListener("click", function (ev) {
      valEl.value = localStorage.getItem(keyEl.value);
      const tx = db.transaction(["employees"], "readonly");
      const employeeTable = tx.objectStore("employees");
      const getReq = employeeTable.get(keyEl.value);
      getReq.addEventListener("success", function (ev) {
        valEl.value = JSON.stringify(getReq.result);
      });
    });
    document.getElementById("put").addEventListener("click", function (ev) {
      const tx = db.transaction(["employees"], "readwrite");
      const employeeTable = tx.objectStore("employees");
      employeeTable.put(JSON.parse(valEl.value));
    });
  });
</script>

Like LocalStorage, IndexedDB storage is per-origin (for this site, `https://jameshfisher.com:443`).
Unlike LocalStorage, each origin can create _many_ key-value stores.
Each origin can have multiple _databases_.
The database `"exampledb"` is "opened" with:

```js
const req = indexedDB.open("exampledb", 1);
req.addEventListener("upgradeneeded", (ev) => {
  const db = req.result;
  // ...
});
req.addEventListener("success", () => {
  const db = req.result;
  // ...
});
```

There are two important listeners: `success` and `upgradeneeded`.
Databases in IndexedDB are _versioned_, and `upgradeneeded` is used for database migrations.
A database version is a natural number, beginning at version 1.
If you view `"exampledb"` in Developer Tools, you'll see it's at version 1.
A call to `indexedDB.open("exampledb", n)` compares `n` with the current version.
If `current_version < n`, the `upgradeneeded` listener is called.

Each database can have multiple _object stores_,
which are similar to tables in an RDBMS.
The `"exampledb"` database has one object store called `"employees"`.
Object stores can only be created in the `upgradeneeded` listener
(similar to how tables in an RDBMS are conventionally only created in migrations).
Here's the `upgradeneeded` listener for `"exampledb"`:

```js
req.addEventListener("upgradeneeded", (ev) => {
  const db = req.result;
  db.createObjectStore("employees", { keyPath: "name" });
});
```

In the call to `createObjectStore`,
the parameter `keyPath` defines the _primary key_ for objects in the store.
With `keyPath` set to `"name"`,
the object `{name: "Jim", position: "CEO"}` will be stored under the key `"Jim"`.

The other important listener is for `success`,
which gives us our database handle:

```js
req.addEventListener("success", () => {
  const db = req.result;
  // ...
});
```

With our `db` handle in place, we can get/put items:

```js
function putEmployee(employee) {
  const tx = db.transaction(["employees"], "readwrite");
  const employeeTable = tx.objectStore("employees");
  employeeTable.put(employee);
}

function getEmployee(name, cb) {
  valEl.value = localStorage.getItem(keyEl.value);
  const tx = db.transaction(["employees"], "readonly");
  const employeeTable = tx.objectStore("employees");
  const getReq = employeeTable.get(name);
  getReq.addEventListener("success", () => cb(getReq.result));
}
```
