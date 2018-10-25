/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict'

Application.Services.factory('Member', ['$resource', $resource =>
  $resource('/api/members/:id',
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      lastSubscribed: {
        method: 'GET',
        url: '/api/last_subscribed/:limit',
        params: { limit: '@limit' },
        isArray: true
      },
      merge: {
        method: 'PUT',
        url: '/api/members/:id/merge'
      },
      list: {
        url: '/api/members/list',
        method: 'POST',
        isArray: true
      },
      search: {
        method: 'GET',
        url: '/api/members/search/:query',
        params: { query: '@query' },
        isArray: true
      },
      mapping: {
        method: 'GET',
        url: '/api/members/mapping'
      }
    }
  )

])
