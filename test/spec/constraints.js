'use strict';

var Helper = require('../helper');


describe('constraints', function() {

  var createModel = Helper.createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'constraints' ]);

  it('should accept allowed values', function() {

    var g = 'male',
        a = 30,
        n = 'Max Mustermann-Musterlich';

    var p = model.create('cnstr:Person', {
      gender: g,
      age: a,
      name: n
    });

    expect(p.gender).to.equal(g);
    expect(p.age).to.equal(a);
    expect(p.name).to.equal(n);
  });

  it('should reject wrong values', function() {

    try {
      model.create('cnstr:Person', {
        gender: 'mascfluid'
      });
    } catch (e) {
      var genderRejected = true;
    }

    try {
      model.create('cnstr:Person', {
        age: -10
      });
    } catch (e) {
      var ageRejected = true;
    }

    try {
      model.create('cnstr:Person', {
        name: 'this-is-an@email.adress'
      });
    } catch (e) {
      var nameRejected = true;
    }

    expect(genderRejected).to.exist;
    expect(ageRejected).to.exist;
    expect(nameRejected).to.exist;
  });

  it('should constrain constrain collections', function() {

    var e = [ 'a@b.c', 'e@f.d' ];

    var p = model.create('cnstr:Person', {
      emails: e
    });

    expect(p.emails).to.equal(e);
  });

  it('should constrain only built-in types', function() {

    var spouse = model.create('cnstr:Person');

    var p = model.create('cnstr:Person', {
      spouse: spouse
    });
  });

  it('should recognize elements correctly as valid', function() {

    var validList = model.create('cnstr:NonEmptyList', {
      entries: [ 1 ]
    });

    var validNumber = model.create('cnstr:ANumber', {
      theNumber: 1
    });

    var invalidList = model.create('cnstr:NonEmptyList');

    var invalidNumber = model.create('cnstr:ANumber');

    expect(validList.isValid()).to.be.true;
    expect(validNumber.isValid()).to.be.true;
    expect(invalidList.isValid()).to.be.false;
    expect(invalidNumber.isValid()).to.be.false;
  });

  it('should set uniquely required properties accordingly', function() {

    var number = model.create('cnstr:ANumber');
    number.setUniquelyRequired();

    expect(number.theNumber).to.equal(1);
  });
});
