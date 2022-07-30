import { expect } from 'chai';
import { stub } from 'sinon';
import mongoose from 'mongoose';

import { User } from '../models/user';
import { login, getStatus } from '../controllers/auth';

describe('Auth controller', () => {
  before(function (done) {
    mongoose.connect(process.env.TEST_MONGODB_URI)
      .then(() => {
        const user = new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'Test',
          posts: [],
          _id: '123412341234'
        });
        return user.save();
      })
      .then(() => {
        done();
      })
  })

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  })

  it('Should throw an error with code 500 if accessing the database fails', (done) => {
    stub(User, 'findOne');

    (User.findOne as any).throws();

    const request = {
      body: {
        email: 'test@test.com',
        password: 'test'
      }
    };

    (login(request as any, {} as any, () => {}) as any).then((result) => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    (User.findOne as any).restore();
  });

  it('should send a response with a valid user status for an existing user', (done) => {
      const request = {
        userId: '123412341234',
      };
      const response = {
        statusCode: 500,
        userStatus: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.userStatus = data.status;
        }
      };

      (getStatus(request as any, response as any, () => {}) as any)
        .then(() => {
          expect(response.statusCode).to.be.equal(200);
          expect(response.userStatus).to.be.equal('I am new');
          done();
        });
  });
});
