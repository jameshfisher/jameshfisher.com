---
title: "UNIX as a SQL database"
---

UNIX is full of tables. When we talk about "processes", we're really referring to "rows in a process table." When we talk about "file descriptors", we're really referring to "rows in a per-process file descriptor table". There are other tables, too: a global file table, an inode table, routing tables, a mount table, page tables, and other tables I don't know about.

These "tables" are custom in-memory data structures, but can be understood relationally. Here's a simplified description of them in SQL.

```sql
-- One row = one process
CREATE TABLE process (
  pid INT PRIMARY KEY,
  -- ...
);

-- Links processes to files via descriptors.
-- In reality, may be implemented as per-process tables (blocks of memory).
CREATE TABLE descriptor (
  pid INT FOREIGN KEY process (pid),
  file_descriptor INT,
  file_id INT FOREIGN KEY file (id)
  PRIMARY KEY (pid, file_descriptor)
);

-- Global file table
CREATE TABLE file (
  id INT AUTOINCREMENT PRIMARY KEY,
  offset_bytes INT NOT NULL,
  -- ...
  inode_number NOT NULL FOREIGN KEY inode_cache (inode_number)
);

-- A cache of inodes on disk
CREATE TABLE inode_cache (
  inode_number INT PRIMARY KEY,
  -- ...
);

CREATE TABLE pages (
  pid INT FOREIGN KEY process (pid),
  virtual_page BITSTRING,
  physical_frame BITSTRING FOREIGN KEY ...,
  PRIMARY KEY (pid, virtual_page)
);
```
