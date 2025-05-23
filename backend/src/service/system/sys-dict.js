import SysDict from '../../model/system/sys-dict.js';

class SysDictService {
  async page(pageNumber, pageSize) {
    console.log(">>>",pageNumber,pageSize)
    try {
      const sysDicts = await SysDict.findAll({
        order: [['id', 'ASC']],
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize
      });
      // 使用 count 方法获取总数
      const total = await SysDict.count();

      const responseData = {
        sysDicts,
        page_number: pageNumber,
        has_previous: pageNumber > 1,
        has_next: total === pageSize,
        total_pages: Math.ceil(total / pageSize),
        total: total
      };
      return responseData;
    } catch (error) {
      console.log(error)
    }

  }

  // Move all functions inside the class as methods
  async save(sysDictData) {
    const sysDict = await SysDict.create(sysDictData);
    return sysDict;
  }

  async update(sysDictData) {
    const sysDict = await SysDict.update(sysDictData,{where:{id:sysDictData.id}});
    return sysDict;
  }


  async deleteDict(id) {
    await SysDict.destroy({ where: { id: id } });
  }


  async getDict(id) {
    const sysDict = await SysDict.findByPk(id);
    return sysDict;
  }

  async getChildDict(parent_code) {
    const sysDict = await SysDict.findOne({ where: { code: parent_code } });
    const sysDicts = await SysDict.findAll({ where: { parent: sysDict.id } });
    return sysDicts;
  }

  async getDictByCode(code) {
    const sysDict = await SysDict.findOne({ where: { code: code } });
    return sysDict;
  }

  async addOrUpdate(code, value) {
    const existingDict = await SysDict.findOne({ where: { code: code } });
    if (existingDict) {
      existingDict.value = value;
      await existingDict.save();
      return existingDict;
    } else {
      const newDict = await SysDict.create({code, value });
      return newDict;
    }
  }

  // New method to get cookies by code
  async getCookies(code) {
    const sysDict = await this.getDictByCode(code);
    if (sysDict) {
      return JSON.parse(sysDict.value);
    }
  }

  async deleteAll() {
    await SysDict.destroy({ where: {} });
  }

}

export default new SysDictService;