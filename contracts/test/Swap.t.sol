// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {console} from "forge-std/console.sol";

import "../contracts/Swap.sol";

import "../src/myERC20.sol";

contract SwapTest is Test {
    MyToken token1;
    MyToken token2;
    SwapERC20 swap;

    address _buyer = address(1);
    address _seller = address(2);

    event Balance(uint256 s, uint256 b);
    // event Raito(uint256 min, uint256 max);
    event OrderId(uint256 id, SwapERC20.State s);

    error UnsupportedERC20();

    //set 2 erc20 tokens.
    function setUp() public {
        token1 = new MyToken("token1", "TK1");
        token2 = new MyToken("token2", "TK2");

        //dex platform.
        swap = new SwapERC20(
            address(token1),
            address(token2),
            address(this),
            0
        );

        //add token support.
        swap.addERC20Support(IERC20(token1));
        swap.addERC20Support(IERC20(token2));

        token1.mint(_buyer, 10e18);
        token1.mint(_seller, 10e18);

        token2.mint(_buyer, 10e18);
        token2.mint(_seller, 10e18);
    }

    function testOfferAndBuy() public {
        uint256 b1 = token1.balanceOf(_buyer);
        uint256 b2 = token1.balanceOf(_seller);

        //buy.
        vm.startPrank(_seller);
        //set approve
        token1.approve(address(swap), type(uint256).max);
        //call offer
        swap.offer(address(token1), 2e18, address(token2), 1e18);

        //check range
        (uint256 min, uint256 max) = swap.getSwapRange(
            address(token1),
            address(token2)
        );

        assertEq(min, 2_000_000);
        assertEq(max, 2_000_000);

        //place another order.
        swap.offer(address(token1), 2e18, address(token2), 2e18);

        //place another order.
        swap.offer(address(token1), 2e18, address(token2), 5e18);

        //check range
        (min, max) = swap.getSwapRange(address(token1), address(token2));

        assertEq(min, 400_000);
        assertEq(max, 2_000_000);

        SwapERC20.Instance[] memory instan = swap.onSellOffers();

        for (uint256 i = 0; i < instan.length; i++) {
            emit OrderId(instan[i].id, instan[i].state);
        }

        vm.stopPrank();
        vm.startPrank(_buyer);

        //set approve
        token2.approve(address(swap), type(uint256).max);

        //place a buy order.
        swap.buy(address(token2), 2e18, address(token1), 2e18);

        vm.stopPrank();
        vm.startPrank(_seller);
        SwapERC20.Instance[] memory instanAfterBuy = swap.onSellOffers();
        for (uint256 i = 0; i < instanAfterBuy.length; i++) {
            emit OrderId(instanAfterBuy[i].id, instanAfterBuy[i].state);
        }

        //buy 1e18 + 2e18
        assertEq(token2.balanceOf(_buyer), 9e18);
    }

    function testTokenNotSupport() public {
        address noneSupportToken1 = address(100);
        address noneSupportToken2 = address(101);
        vm.expectRevert(UnsupportedERC20.selector);
        swap.offer(noneSupportToken1, 1, noneSupportToken2, 1);
    }

    function testGetSwapRang() public {
        //buy.
        vm.startPrank(_seller);
        //set approve
        token1.approve(address(swap), type(uint256).max);

        //call offer
        swap.offer(address(token1), 2e18, address(token2), 1e18);

        //place another order.
        swap.offer(address(token1), 2e18, address(token2), 5e18);

        (uint256 min, uint256 max) = swap.getSwapRange(
            address(token1),
            address(token2)
        );

        assertEq(min, 400_000); //0.4
        assertEq(max, 2_000_000); //2
    }
}
