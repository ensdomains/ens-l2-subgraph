# ENS l2 subgraph

## Setup

Please refer to https://github.com/ensdomains/context-resolver

## Example queries

```
  query{
    domains{
      name
      context
      parent
      subdomains{
        id
      }
      resolver{
        addr
        texts
        con
        coinTypes
        contentHash
      }
    }
  }
```
