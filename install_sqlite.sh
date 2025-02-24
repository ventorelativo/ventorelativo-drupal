#!/bin/bash
wget https://www.sqlite.org/2024/sqlite-autoconf-3450000.tar.gz
tar xvf sqlite-autoconf-3450000.tar.gz
cd sqlite-autoconf-3450000
./configure --prefix=$HOME/sqlite
make && make install
export PATH=$HOME/sqlite/bin:$PATH
sqlite3 --version
