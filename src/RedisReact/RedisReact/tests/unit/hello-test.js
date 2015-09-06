/** @jsx React.DOM */

// __tests__/CheckboxWithLabel-test.js
jest.dontMock('../../js/components/hello.jsx');
describe('HelloWorld component test', function() {
    it('renders to the DOM', function () {
        
        var React = require('react/addons');
        var HelloWorld = require('../../js/components/hello.jsx');
        var TestUtils = React.addons.TestUtils;

        // Render a hello world input in the document
        var helloWorldElement = TestUtils.renderIntoDocument(
           <HelloWorld />
        );
        //// Verify itar contains input
        var input = TestUtils.findRenderedDOMComponentWithTag(
          helloWorldElement, 'input');
        expect(input != null).toEqual(true);
    });
});