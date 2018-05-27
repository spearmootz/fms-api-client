/* global describe before beforeEach it */

/* eslint-disable */

const assert = require('assert');
const { expect, should } = require('chai');

/* eslint-enable */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const environment = require('dotenv');
const varium = require('varium');
const { connect } = require('marpat');
const { Filemaker } = require('../index.js');

chai.use(chaiAsPromised);

describe('Find Capabilities', () => {
  let database, client;
  before(done => {
    environment.config({ path: './tests/.env' });
    varium(process.env, './tests/env.manifest');
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() => {
        return done();
      });
  });

  beforeEach(done => {
    client = Filemaker.create({
      application: process.env.APPLICATION,
      server: process.env.SERVER,
      user: process.env.USERNAME,
      password: process.env.PASSWORD
    });
    done();
  });

  it('should perform a find request', () => {
    return expect(client.find(process.env.LAYOUT, [{ id: '*' }, { name: '*' }]))
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data');
  });

  it('should allow you to use an object instead of an array for a find', () => {
    return expect(
      client.find(process.env.LAYOUT, {
        name: 'Luke Skywalker'
      })
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data');
  });

  it('should specify omit Criterea', () => {
    return expect(
      client.find(process.env.LAYOUT, [
        { id: '*' },
        { omit: 'true', name: 'Darth Vader' }
      ])
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data');
  });

  it('should allow additional parameters to manipulate the results', () => {
    return expect(client.find(process.env.LAYOUT, { id: '*' }, { limit: '2' }))
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should allow you to use numbers in the find query parameters', () => {
    return expect(client.find(process.env.LAYOUT, { id: '*' }, { limit: 2 }))
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should allow you to sort the results', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        { sort: [{ fieldName: 'id', sortOrder: 'descend' }], limit: 2 }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data')
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should return an empty array if the find does not return results', () => {
    return expect(
      client.find(process.env.LAYOUT, { name: 'bruce springsteen' })
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data', 'message')
      .and.property('data')
      .to.have.a.lengthOf(0);
  });

  it('should allow you run a pre request script', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        { 'script.prerequest': 'FMS Triggered Script', limit: 2 }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys(
        'data',
        'scriptResult.prerequest',
        'scriptError.prerequest'
      )
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should return a response even if a script fails', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        { script: 'Error Script', limit: 2 }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data', 'scriptResult', 'scriptError')
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should allow you to send a parameter to the pre request script', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        {
          'script.prerequest.param': 'Han',
          'script.prerequest': 'FMS Triggered Script',
          limit: 2
        }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys(
        'data',
        'scriptResult.prerequest',
        'scriptError.prerequest'
      )
      .and.property('data')
      .to.have.a.lengthOf(2);
  });

  it('should allow you run script after the find and before the sort', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        {
          'script.presort': 'FMS Triggered Script',
          'script.presort.param': 'han',
          sort: [{ fieldName: 'id', sortOrder: 'descend' }],
          limit: 2
        }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data', 'scriptResult.presort', 'scriptError.presort')
      .and.property('scriptError.presort')
      .to.equal(0);
  });

  it('should allow you to pass a parameter to a script after the find and before the sort', () => {
    return expect(
      client.find(
        process.env.LAYOUT,
        { id: '*' },
        {
          'script.presort': 'FMS Triggered Script',
          sort: [{ fieldName: 'id', sortOrder: 'descend' }],
          limit: 2
        }
      )
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('data', 'scriptResult.presort', 'scriptError.presort')
      .and.property('scriptError.presort')
      .to.equal(0);
  });

  it('should reject of there is an issue with the find request', () => {
    return expect(client.find('No Layout', { id: '*' }).catch(error => error))
      .to.eventually.be.a('object')
      .that.has.all.keys('code', 'message');
  });
});
