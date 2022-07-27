import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { stub } from 'sinon';
import { auth } from '../middleware/auth';


describe('auth middleware', function () {
  it('should yield a userId after decoding the token', function () {
    const request = {
      get: function (headerName) { return 'Bearer xyz' }
    };

    stub(jwt, 'verify');

    (jwt.verify as any).returns({ userId: '123' });

    auth(request as any, {} as any, function () {});

    expect(request).to.have.property('userId', '123');
    expect((jwt.verify as any).called).to.be.true;
    (jwt.verify as any).restore();
  });
});
