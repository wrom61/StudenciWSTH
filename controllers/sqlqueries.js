
exports.qSelectUserById = 'SELECT * FROM users WHERE id = ?'

exports.qUpdateUser = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, userNick = ?, address1 = ?, address2 = ?, zipCode1 = ?, zipCode2 = ?, town1 = ?, town2 = ?, phone = ?, comment = ?, userModifiedBy = ?, userModifiedDate = ?, level = ?, instituteId_access = ?, branchId_access = ? WHERE id = ?'

exports.qSelectUserByUserNick =  'SELECT * FROM users WHERE userNick = ?'

exports.qSelectByUserNick = "SELECT id, userNick, level, instituteId_access, branchId_access FROM users WHERE id = ?"

exports.qSelectIdByUserNick = "SELECT userNick FROM users WHERE userNick = ?"