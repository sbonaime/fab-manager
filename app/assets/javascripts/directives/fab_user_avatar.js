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
Application.Directives.directive('fabUserAvatar', [ () =>
  ({
    restrict: 'E',
    scope: {
      userAvatar: '=ngModel',
      avatarClass: '@'
    },
    templateUrl: '<%= asset_path "shared/_user_avatar.html" %>'
  })

])
