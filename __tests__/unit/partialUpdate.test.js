const sqlForPartialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {

    // FIXME: write real tests!
    const update = sqlForPartialUpdate('test', {handle: "tst", name: "Test Inc.", num_employees: 5}, 'handle', 'ttt')
    expect(update.query).toEqual("UPDATE test SET handle=$1, name=$2, num_employees=$3 WHERE handle=$4 RETURNING *")
    expect(update.values).toEqual(['tst', 'Test Inc.', 5, 'ttt'])
    // expect(false).toEqual(true);

  });
});
