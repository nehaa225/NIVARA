const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../exceptions/AppError');
const Logger = require('../utils/logger');

const prisma = new PrismaClient();
const MODULE = 'NGO_REPOSITORY';

/**
 * NGO data access layer
 */
class NGORepository {
  /**
   * Find NGO by user ID
   */
  static async findByUserId(userId, includeRelations = true) {
    try {
      const ngo = await prisma.nGO.findUnique({
        where: { userId },
        include: includeRelations ? {
          documents: true,
          applications: true,
          messages: true,
          donations: true
        } : undefined
      });

      if (!ngo) {
        throw new NotFoundError('NGO', userId);
      }

      return ngo;
    } catch (error) {
      Logger.error(MODULE, 'Error finding NGO by userId', error);
      throw error;
    }
  }

  /**
   * Find NGO by ID
   */
  static async findById(id, includeRelations = true) {
    try {
      const ngo = await prisma.nGO.findUnique({
        where: { id },
        include: includeRelations ? {
          documents: true,
          applications: true
        } : undefined
      });

      if (!ngo) {
        throw new NotFoundError('NGO', id);
      }

      return ngo;
    } catch (error) {
      Logger.error(MODULE, 'Error finding NGO by id', error);
      throw error;
    }
  }

  /**
   * Create NGO
   */
  static async create(data) {
    try {
      const ngo = await prisma.nGO.create({ data });
      Logger.info(MODULE, `NGO created: ${ngo.id}`);
      return ngo;
    } catch (error) {
      Logger.error(MODULE, 'Error creating NGO', error);
      throw error;
    }
  }

  /**
   * Update NGO
   */
  static async update(id, data) {
    try {
      const ngo = await prisma.nGO.update({
        where: { id },
        data
      });
      Logger.info(MODULE, `NGO updated: ${id}`);
      return ngo;
    } catch (error) {
      Logger.error(MODULE, `Error updating NGO ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all approved NGOs
   */
  static async findApproved() {
    try {
      return await prisma.nGO.findMany({
        where: { status: 'APPROVED' },
        select: {
          id: true,
          name: true,
          category: true,
          yearEstablished: true,
          website: true,
          address: true,
          state: true,
          district: true,
          pinCode: true,
          founderName: true,
          email: true,
          mobile: true
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      Logger.error(MODULE, 'Error finding approved NGOs', error);
      throw error;
    }
  }

  /**
   * Find NGOs by status
   */
  static async findByStatus(status) {
    try {
      return await prisma.nGO.findMany({
        where: { status },
        include: { documents: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      Logger.error(MODULE, `Error finding NGOs with status ${status}`, error);
      throw error;
    }
  }
}

module.exports = NGORepository;
