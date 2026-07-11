const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../exceptions/AppError');
const Logger = require('../utils/logger');

const prisma = new PrismaClient();
const MODULE = 'GRANT_REPOSITORY';

/**
 * Grant data access layer
 */
class GrantRepository {
  /**
   * Find all grants
   */
  static async findAll() {
    try {
      return await prisma.grant.findMany();
    } catch (error) {
      Logger.error(MODULE, 'Error finding all grants', error);
      throw error;
    }
  }

  /**
   * Find grant by ID
   */
  static async findById(id) {
    try {
      const grant = await prisma.grant.findUnique({
        where: { id },
        include: { applications: true }
      });

      if (!grant) {
        throw new NotFoundError('Grant', id);
      }

      return grant;
    } catch (error) {
      Logger.error(MODULE, `Error finding grant ${id}`, error);
      throw error;
    }
  }

  /**
   * Create grant
   */
  static async create(data) {
    try {
      const grant = await prisma.grant.create({ data });
      Logger.info(MODULE, `Grant created: ${grant.id}`);
      return grant;
    } catch (error) {
      Logger.error(MODULE, 'Error creating grant', error);
      throw error;
    }
  }

  /**
   * Update grant
   */
  static async update(id, data) {
    try {
      const grant = await prisma.grant.update({
        where: { id },
        data
      });
      Logger.info(MODULE, `Grant updated: ${id}`);
      return grant;
    } catch (error) {
      Logger.error(MODULE, `Error updating grant ${id}`, error);
      throw error;
    }
  }

  /**
   * Upsert grant (create if not exists, update if exists)
   */
  static async upsert(uniqueKey, data) {
    try {
      const grant = await prisma.grant.upsert({
        where: uniqueKey,
        update: data,
        create: data
      });
      Logger.info(MODULE, `Grant upserted: ${grant.id}`);
      return grant;
    } catch (error) {
      Logger.error(MODULE, 'Error upserting grant', error);
      throw error;
    }
  }

  /**
   * Find grants by sector
   */
  static async findBySector(sector) {
    try {
      return await prisma.grant.findMany({
        where: { sector }
      });
    } catch (error) {
      Logger.error(MODULE, `Error finding grants by sector ${sector}`, error);
      throw error;
    }
  }

  /**
   * Find grants by state
   */
  static async findByState(state) {
    try {
      return await prisma.grant.findMany({
        where: {
          OR: [
            { state: state },
            { state: 'National' }
          ]
        }
      });
    } catch (error) {
      Logger.error(MODULE, `Error finding grants by state ${state}`, error);
      throw error;
    }
  }

  /**
   * Delete grant by ID
   */
  static async delete(id) {
    try {
      await prisma.grant.delete({ where: { id } });
      Logger.info(MODULE, `Grant deleted: ${id}`);
    } catch (error) {
      Logger.error(MODULE, `Error deleting grant ${id}`, error);
      throw error;
    }
  }

  /**
   * Clear all grants
   */
  static async deleteAll() {
    try {
      const result = await prisma.grant.deleteMany();
      Logger.info(MODULE, `Deleted ${result.count} grants`);
      return result;
    } catch (error) {
      Logger.error(MODULE, 'Error deleting all grants', error);
      throw error;
    }
  }
}

module.exports = GrantRepository;
