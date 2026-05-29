import { and, eq, ilike, or, sql, desc, getTableColumns } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { classes, departments, enrollments, subjects, user } from "../../db/schema/index";
import { db } from "../../db";

export const usersRoutes: FastifyPluginAsyncZod = async app => {
  app.get("/", 
    {
      schema: {
        summary: 'Listar usuários',
        tags: ['Users'],
        querystring: z.object({
          search: z.string().optional(),
          role: z.string().optional(),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10)
        }),
      }, 
    }, async (request, reply) => {
      const { search, role, page = 1, limit=10} = request.query
      
      const currentPage = Math.max(1, +page)
      const limitPerPage = Math.max(1, +limit)
      
      const offset = (currentPage - 1) * limitPerPage
      
      const filterConditions = []
      
      if ( search ) {
        filterConditions.push(
          or(
            ilike(user.name, `%${search}`),
            ilike(user.email, `%${search}`),
          )
        )
      }
      
      if (role) {
        filterConditions.push(eq(user.role, role as UserRoles));
      }
      
      const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;
      
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(whereClause);

      const totalCount = countResult[0]?.count ?? 0;
      
      const usersList = await db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limitPerPage)
        .offset(offset);
      
      return {
        data: usersList,
        pagination: {
          page: currentPage,
          limit: limitPerPage,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitPerPage),
        },
      }
    }
  )
  
  app.get("/:id",
    {
      schema: {
        summary: 'Listar detalhes do usuário',
        tags: ['Users'],
        params: z.object({
          id: z.string()
        })
      }
    }, async (request, reply) => {
      
      const userId = request.params.id;
      
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));
  
      if (!userRecord) {
        return reply.status(404).send({ error: "User not found" });
      }
      
      return {
        data: userRecord
      }
    }
  )
  
  app.get("/:id/departments",
    {
      schema: {
        summary: "Listar departamentos associados ao usuário",
        tags: ['Users'],
        params: z.object({
          id: z.string()
        }),
        querystring: z.object({
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
        }),
      },
    }, async ( request, reply ) => {
      const userId = request.params.id;
      const { page = 1, limit = 10 } = request.query;
      
      const [userRecord] = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, userId));
  
      if (!userRecord) {
        return reply.status(404).send({ error: "User not found" });
      }
      
      if (userRecord.role !== "teacher" && userRecord.role !== "student") {
        return reply.status(200).send({
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0,
          },
        });
      }
      
      const currentPage = Math.max(1, +page);
      const limitPerPage = Math.max(1, +limit);
      const offset = (currentPage - 1) * limitPerPage;

      const countResult =
        userRecord.role === "teacher"
          ? await db
            .select({ count: sql<number>`count(distinct ${departments.id})` })
            .from(departments)
            .leftJoin(subjects, eq(subjects.departmentId, departments.id))
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .where(eq(classes.teacherId, userId))
          : await db
            .select({ count: sql<number>`count(distinct ${departments.id})` })
            .from(departments)
            .leftJoin(subjects, eq(subjects.departmentId, departments.id))
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .leftJoin(enrollments, eq(enrollments.classId, classes.id))
            .where(eq(enrollments.studentId, userId));
      
      const totalCount = countResult[0]?.count ?? 0;

      const departmentsList =
      userRecord.role === "teacher"
        ? await db
          .select({
            ...getTableColumns(departments),
          })
          .from(departments)
          .leftJoin(subjects, eq(subjects.departmentId, departments.id))
          .leftJoin(classes, eq(classes.subjectId, subjects.id))
          .where(eq(classes.teacherId, userId))
          .groupBy(
            departments.id,
            departments.code,
            departments.name,
            departments.description,
            departments.createdAt,
            departments.updatedAt
          )
          .orderBy(desc(departments.createdAt))
          .limit(limitPerPage)
          .offset(offset)
        : await db
          .select({
            ...getTableColumns(departments),
          })
          .from(departments)
          .leftJoin(subjects, eq(subjects.departmentId, departments.id))
          .leftJoin(classes, eq(classes.subjectId, subjects.id))
          .leftJoin(enrollments, eq(enrollments.classId, classes.id))
          .where(eq(enrollments.studentId, userId))
          .groupBy(
            departments.id,
            departments.code,
            departments.name,
            departments.description,
            departments.createdAt,
            departments.updatedAt
          )
          .orderBy(desc(departments.createdAt))
          .limit(limitPerPage)
          .offset(offset);
      
      return {
        data: departmentsList,
        pagination: {
          page: currentPage,
          limit: limitPerPage,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitPerPage),
        },
      }
    }
  )
  
  app.get("/:id/subjects",
    {
      schema: {
        summary: "Listar matérias associados ao usuário",
        tags: ['Users'],
        params: z.object({
          id: z.string()
        }),
        querystring: z.object({
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
        }),
      },
    }, async (request, reply) => {
      const userId = request.params.id;
      const { page = 1, limit = 10 } = request.query;
  
      const [userRecord] = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, userId));
  
      if (!userRecord) {
        return reply.status(404).send({ error: "User not found" });
      }
  
      if (userRecord.role !== "teacher" && userRecord.role !== "student") {
        return reply.status(200).send({
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0,
          },
        });
      }
  
      const currentPage = Math.max(1, +page);
      const limitPerPage = Math.max(1, +limit);
      const offset = (currentPage - 1) * limitPerPage;
  
      const countResult =
        userRecord.role === "teacher"
          ? await db
            .select({ count: sql<number>`count(distinct ${subjects.id})` })
            .from(subjects)
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .where(eq(classes.teacherId, userId))
          : await db
            .select({ count: sql<number>`count(distinct ${subjects.id})` })
            .from(subjects)
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .leftJoin(enrollments, eq(enrollments.classId, classes.id))
            .where(eq(enrollments.studentId, userId));
  
      const totalCount = countResult[0]?.count ?? 0;
  
      const subjectsList =
        userRecord.role === "teacher"
          ? await db
            .select({
              ...getTableColumns(subjects),
              department: {
                ...getTableColumns(departments),
              },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .where(eq(classes.teacherId, userId))
            .groupBy(
              subjects.id,
              subjects.departmentId,
              subjects.name,
              subjects.code,
              subjects.description,
              subjects.createdAt,
              subjects.updatedAt,
              departments.id,
              departments.code,
              departments.name,
              departments.description,
              departments.createdAt,
              departments.updatedAt
            )
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset)
        : await db
            .select({
              ...getTableColumns(subjects),
              department: {
                ...getTableColumns(departments),
              },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .leftJoin(classes, eq(classes.subjectId, subjects.id))
            .leftJoin(enrollments, eq(enrollments.classId, classes.id))
            .where(eq(enrollments.studentId, userId))
            .groupBy(
              subjects.id,
              subjects.departmentId,
              subjects.name,
              subjects.code,
              subjects.description,
              subjects.createdAt,
              subjects.updatedAt,
              departments.id,
              departments.code,
              departments.name,
              departments.description,
              departments.createdAt,
              departments.updatedAt
            )
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);
  
      return {
        data: subjectsList,
        pagination: {
          page: currentPage,
          limit: limitPerPage,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitPerPage),
        },
      };
    }
  )
}