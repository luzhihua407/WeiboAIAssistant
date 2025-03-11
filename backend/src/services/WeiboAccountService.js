import WeiboAccount from '#root/models/WeiboAccount.js';

class WeiboAccountService {
    async save(weiboAccountData) {
        const weiboAccount = await WeiboAccount.create(weiboAccountData);
        return weiboAccount;
    }

    async update(weiboAccountData) {
        const weiboAccount = await WeiboAccount.update(weiboAccountData, { where: { id: weiboAccountData.id } });
        return weiboAccount;
    }

    async getById(id) {
        const weiboAccount = await WeiboAccount.findByPk(id);
        if (!weiboAccount) {
            throw new Error('WeiboAccount not found');
        }
        return weiboAccount;
    }

    async findOne() {
        return await WeiboAccount.findOne();
    }

    async saveOrUpdate(weiboAccountData) {
        const existingAccount = await WeiboAccount.findOne();
        if (existingAccount) {
            weiboAccountData.id = existingAccount.id;
            return await this.update(weiboAccountData);
        } else {
            return await this.save(weiboAccountData);
        }
    }
}

export default new WeiboAccountService;
