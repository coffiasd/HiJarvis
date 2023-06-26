# PeerTradeX

## Links

- youtube: <https://www.youtube.com/watch?v=mv54n62_t1M&ab_channel=ayden-hackathon>
- website: <https://digital-tickets-stream.vercel.app/>

## Overview

### Summary

### Features

### Flowchart

![alt ""](./public/DST.png)

### Code Snippet

## Support Chains

- Gobi Testnet

## Document tree

```shell
$ tree -d -L 2 -I 'node_modules'
PeerTradeX
├── cache
├── components     | react components
├── contracts      | hardhat contracts
│   ├── artifacts
│   ├── cache
│   ├── contracts  |conrtacts .sol file
│   ├── scripts
│   ├── src
│   └── test       |foundry test case
├── lib            |foundry libs
│   ├── forge-std
│   └── openzeppelin-contracts
├── out
├── pages          |react pages
│   └── api
├── public         |root
│   └── network
├── services
├── styles         |css
└── utils          |json file.


```

## Test

```shell
cd contract
forge test --match-contract SwapTest -vvv

Compiler run successful (with warnings)

Running 3 tests for contracts/test/Swap.t.sol:SwapTest
[PASS] testGetSwapRang() (gas: 836599)
[PASS] testOfferAndBuy() (gas: 1182303)
[PASS] testTokenNotSupport() (gas: 13202)
Test result: ok. 3 passed; 0 failed; finished in 2.01ms
```

## Reference

- [1] tailwindcss https://tailwindcss.com/
- [2] dasyUi https://daisyui.com/
- [3] next.js https://nextjs.org/
- [4] ether.js https://docs.ethers.org/v6/
- [5] hardhat https://hardhat.org/
- [6] foundry https://book.getfoundry.sh/forge/writing-tests

## License

SPDX short identifier: MIT
