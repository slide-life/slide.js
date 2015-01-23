All current tests

Assertions to do:
    validatesRecordable: [ validatesLocalStorage, validatesCryptoDecryptsKey(privateKey, key), validatesObservable ]
    validatesObservable: [ ]
    validatesChecksum: [ validatesValidChecksumResponse, validatesInvalidChecksumResponse ]
    validatesInviteCode: [ ... same ]
    validatesLocalStorage: Validate retrieval of details from LocalStorage
    validatesCryptoDecryptsKey: Validate detail decryption

Tests to do:
    Create User
        validatesRecordable
        validatesCryptoDecryptsKey(this.privateKey, this.profile)
    Create Vendor
        validatesRecordable
        validatesChecksum
        validatesInviteCode
    Create VendorUser
        on valid user: validatesCreation
        validatesRecordable
        validatesChecksum
        validatesInviteCode
    Vendor creates a VendorForm
        validatesObservable
    VendorUser lists VendorForms
        validates existence of created VendorForm
    Vendor lists VendorForms
        validates existence of created VendorForm
    Mobile ->
        Vendor creates a conversation with VendorForm as upstream ->
        Vendor sends request to user ->
        User responds to request
    Web ->
        Display Form with VendorForm ->
        User submits Form through VendorUser
    Vendor lists latest responses using VendorForms as field filter
    Vendor lists responses on VendorForms
    Vendor lists responses of given list of VendorUsers
    VendorUser views past responses

Low priority:
    User updates details and displays affected VendorForms

---

var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})

--

assert.fail(actual, expected, message, operator)
assert(value, message), assert.ok(value, [message])
assert.equal(actual, expected, [message])
assert.notEqual(actual, expected, [message])
assert.deepEqual(actual, expected, [message])
assert.notDeepEqual(actual, expected, [message])
assert.strictEqual(actual, expected, [message])
assert.notStrictEqual(actual, expected, [message])
assert.throws(block, [error], [message])
assert.doesNotThrow(block, [message])
assert.ifError(value)

--

All current tests

Assertions to do:
    validatesRecordable: [ validatesLocalStorage, validatesCryptoDecryptsKey(privateKey, key), validatesObservable ]
    validatesObservable: [ ]
    validatesChecksum: [ validatesValidChecksumResponse, validatesInvalidChecksumResponse ]
    validatesInviteCode: [ ... same ]
    validatesLocalStorage: Validate retrieval of details from LocalStorage
    validatesCryptoDecryptsKey: Validate detail decryption

Tests to do:
    Create User
        validatesRecordable
        validatesCryptoDecryptsKey(this.privateKey, this.profile)
    Create Vendor
        validatesRecordable
        validatesChecksum
        validatesInviteCode
    Create VendorUser
        on valid user: validatesCreation
        validatesRecordable
        validatesChecksum
        validatesInviteCode
    Vendor creates a VendorForm
        validatesObservable
    VendorUser lists VendorForms
        validates existence of created VendorForm
    Vendor lists VendorForms
        validates existence of created VendorForm
    Mobile ->
        Vendor creates a conversation with VendorForm as upstream ->
        Vendor sends request to user ->
        User responds to request
    Web ->
        Display Form with VendorForm ->
        User submits Form through VendorUser
    Vendor lists latest responses using VendorForms as field filter
    Vendor lists responses on VendorForms
    Vendor lists responses of given list of VendorUsers
    VendorUser views past responses

Low priority:
    User updates details and displays affected VendorForms