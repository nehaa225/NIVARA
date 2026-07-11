const { PrismaClient } = require('@prisma/client');
const Logger = require('../utils/logger');

const prisma = new PrismaClient();
const MODULE = 'APPLICATION_REPOSITORY';

/**
 * Application/Proposal data access layer
 */
class ApplicationRepository {
  /**
   * Create application
   */
  static async create(data) {
    try {
      const application = await prisma.application.create({ data });
      Logger.info(MODULE, `Application created: ${application.id}`);
      return application;
    } catch (error) {
      Logger.error(MODULE, 'Error creating application', error);
      throw error;
    }
  }

  /**
   * Find application by ID
   */
  static async findById(id) {
    try {
      return await prisma.application.findUnique({
        where: { id },
        include: { ngo: true, grant: true }
      });
    } catch (error) {
      Logger.error(MODULE, `Error finding application ${id}`, error);
      throw error;
    }
  }

  /**
   * Find applications by NGO ID
   */
  static async findByNgoId(ngoId) {
    try {
      return await prisma.application.findMany({
        where: { ngoId },
        include: { grant: true },
        orderBy: { appliedAt: 'desc' }
      });
    } catch (error) {
      Logger.error(MODULE, `Error finding applications for NGO ${ngoId}`, error);
      throw error;
    }
  }

  /**
   * Update application
   */
  static async update(id, data) {
    try {
      const application = await prisma.application.update({
        where: { id },
        data
      });
      Logger.info(MODULE, `Application updated: ${id}`);
      return application;
    } catch (error) {
      Logger.error(MODULE, `Error updating application ${id}`, error);
      throw error;
    }
  }
}

module.exports = ApplicationRepository;
