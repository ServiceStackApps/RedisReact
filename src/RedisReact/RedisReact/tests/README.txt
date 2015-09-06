Testing for the ReactJS template is setup to use Jest test framework. https://facebook.github.io/jest/

To run these tests, the `jest-cli` npm package is required. Dependencies of this package require Python 2.7 for installation. 
See `contextify`s GitHub page for more on this issue and step by step instructions https://github.com/brianmcd/contextify/wiki/Windows-Installation-Guide

Once `jest-cli` is istalled globally, running "jest" from a command line in your project will discover and run the example unit test.
See package.json for jest configuration.

To run the tests from grunt use "grunt exec:jest".

For more information on Jest, see its GitHub page here https://github.com/facebook/jest.