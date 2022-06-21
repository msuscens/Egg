
WORKS UNDER GANACHE V6.12.2

$ sudo npm install -g ganache-cli

$ ganache-cli -h 127.0.0.1 -p 8545 -m "quick brown fox jumped over the lazy dog"

$ truffle test

All 27 tests run and pass.  Note: test/6.eggToken_hatch_gen0_test.js advances time using ganache-time-travel to advance time for some tests

  Contract: 2.6 EggToken - Hatch a Gen0 Egg
    Before Incubation complete: Hatch
      ✓ should NOT allow egg owner to hatch it (78ms)
      ✓ should NOT allow non-owner of an egg to hatch it (59ms)
    After Incubation period: Hatch
      ✓ should NOT allow non-owner of an egg to hatch it (46ms)
      ✓ should allow egg's owner to hatch it, emitting an Hatched event  (109ms)
      ✓ should NOT allow egg to be hatched again (after its already been hatched!) (151ms)
      ✓ should NOT allow an egg to hatch after contract is 'paused' state (103ms)
      ✓ should allow an egg to hatch after 'paused' contract is 'unpaused' (298ms)
    After Eggs Hatched (& destroyed): Mint & Hatch another Gen0 Egg
      ✓ should allow egg's owner to hatch it (into a dragon) (85ms)


  27 passing (5s)



FAILS UNDER GANACHE V7.3.1 (and previous versions of Ganache 7)

However, under Ganache v7.3.1 there are 4 test failures all in test/6.eggToken_hatch_gen0_test.js 
In each case the test failure is because time is not advanced as it should be (by ganache-time-traveler)

$ sudo npm install ganache --global

$ ganache -h 127.0.0.1 -p 8545 -m "quick brown fox jumped over the lazy dog"


 Contract: 2.6 EggToken - Hatch a Gen0 Egg
    Before Incubation complete: Hatch
      ✓ should NOT allow egg owner to hatch it
      ✓ should NOT allow non-owner of an egg to hatch it
    After Incubation period: Hatch
      ✓ should NOT allow non-owner of an egg to hatch it (43ms)
      1) should allow egg's owner to hatch it, emitting an Hatched event 
    > No events were emitted
      2) should NOT allow egg to be hatched again (after its already been hatched!)
    > No events were emitted
      ✓ should NOT allow an egg to hatch after contract is 'paused' state (57ms)
      3) should allow an egg to hatch after 'paused' contract is 'unpaused'
    > No events were emitted
    After Eggs Hatched (& destroyed): Mint & Hatch another Gen0 Egg
      4) "before all" hook: Hatch 2x eggs (eggIds 0 & 1) for "should allow egg's owner to hatch it (into a dragon)"


  23 passing (3s)
  4 failing

  1) Contract: 2.6 EggToken - Hatch a Gen0 Egg
       After Incubation period: Hatch
         should allow egg's owner to hatch it, emitting an Hatched event :
     Transaction: 0x0ddab165fe9bb6e56e2e0e25f91a91bf9f9bbef1e71ce7ed664a52fec15e7f6a exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
     Please check that the transaction:
     - satisfies all conditions set by Solidity `require` statements.
     - does not trigger a Solidity `revert` statement.

  StatusError: Transaction: 0x0ddab165fe9bb6e56e2e0e25f91a91bf9f9bbef1e71ce7ed664a52fec15e7f6a exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
      at Context.<anonymous> (test/6.eggToken_hatch_gen0_test.js:133:43)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)

  2) Contract: 2.6 EggToken - Hatch a Gen0 Egg
       After Incubation period: Hatch
         should NOT allow egg to be hatched again (after its already been hatched!):
     AssertionError: Failed with StatusError: Transaction: 0xc07a399847adcf7e6f27a58d6b9b1a1a3937f2210c9a78616675e507768b593b exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
     Please check that the transaction:
     - satisfies all conditions set by Solidity `require` statements.
     - does not trigger a Solidity `revert` statement.

      at passes (node_modules/truffle-assertions/index.js:142:11)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)
      at Context.<anonymous> (test/6.eggToken_hatch_gen0_test.js:147:13)

  3) Contract: 2.6 EggToken - Hatch a Gen0 Egg
       After Incubation period: Hatch
         should allow an egg to hatch after 'paused' contract is 'unpaused':
     Transaction: 0xfee9ed57e6556bbd58eb927150e00acef187d387bb4a4690ad2a2de0cfe2e725 exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
     Please check that the transaction:
     - satisfies all conditions set by Solidity `require` statements.
     - does not trigger a Solidity `revert` statement.

  StatusError: Transaction: 0xfee9ed57e6556bbd58eb927150e00acef187d387bb4a4690ad2a2de0cfe2e725 exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
      at Context.<anonymous> (test/6.eggToken_hatch_gen0_test.js:193:43)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)

  4) Contract: 2.6 EggToken - Hatch a Gen0 Egg
       After Eggs Hatched (& destroyed): Mint & Hatch another Gen0 Egg
         "before all" hook: Hatch 2x eggs (eggIds 0 & 1) for "should allow egg's owner to hatch it (into a dragon)":
     AssertionError: Failed with StatusError: Transaction: 0x0ddab165fe9bb6e56e2e0e25f91a91bf9f9bbef1e71ce7ed664a52fec15e7f6a exited with an error (status 0). Reason given: hatch: Egg is not incubated!.
     Please check that the transaction:
     - satisfies all conditions set by Solidity `require` statements.
     - does not trigger a Solidity `revert` statement.

      at passes (node_modules/truffle-assertions/index.js:142:11)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)
      at Context.<anonymous> (test/6.eggToken_hatch_gen0_test.js:218:13)
