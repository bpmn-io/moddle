'use strict';

var Helper = require('../helper');


describe('enumerations', function() {

  var createModel = Helper.createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'enumerations' ]);

  it('should accept allowed values', function() {

    var yellow = 'Yellow',
        blue = 'Blue',
        red = 'Red',
        colors = [ yellow, blue, red ];

    var yellowColoredThing = model.create('enu:ColoredThing', {
      color: yellow
    });
    expect(yellowColoredThing.color).to.equal(yellow);

    var multiColoredThing = model.create('enu:MultiColoredThing', {
      colors: colors
    });
    expect(multiColoredThing.colors).to.equal(colors);
  });

  it('should reject unlisted values', function() {
    expect(() => {model.create('enu:ColoredThing', { color: 'Striped' })})
      .to.throw(Error);
  });

});
