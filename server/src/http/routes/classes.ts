import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../db/index";
import { classes, departments, enrollments, subjects, user } from "../../db/schema/index";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";

export const classesRoutes: FastifyPluginAsyncZod = async app => {
  app.post('/', 
    {
      schema: {
        summary: 'Criar uma classe',
        tags: ['Classes'],
        body: z.object({
          name: z
            .string()
            .min(3)
            .max(255),
          teacherId: z.string(),
          subjectId: z.number().int(),
          capacity: z
            .number()
            .int()
            .positive()
            .max(500)
            .optional(),
          description: z
            .string()
            .nullable()
            .optional(),
          status: z.enum([
            "active",
            "inactive",
            "archived"
          ]).optional(),
          bannerUrl: z
            .string()
            .url()
            .nullable()
            .optional(),
          bannerCldPubId: z
            .string()
            .nullable()
            .optional(),
        })
      }
    }, async (request, reply) => {
      
      const [createdClass] = await db
        .insert(classes)
        .values({...request.body, inviteCode: Math.random().toString(36).substring(2, 9), schedules: []})
        .returning({ id: classes.id})
      
      if(!createdClass) throw new Error
      
      return reply.status(201).send({
        data: createdClass
      })
    }
  )
  
  app.get('/', 
    {
      schema: {
        summary: 'Listar todas as classes',
        tags: ['Classes'],
        querystring: z.object({
          search: z.string().optional(),
          subject: z.string().optional(),
          teacher: z.string().optional(),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
        })
      }
    }, async (request, reply) => {
      const { search, subject, teacher, page = 1, limit = 10 } = request.query;
      
      const currentPage = Math.max(1, +page);
      const limitPerPage = Math.max(1, +limit);
      const offset = (currentPage - 1) * limitPerPage;
  
      const filterConditions = [];
  
      if (search) {
        filterConditions.push(
          or(
            ilike(classes.name, `%${search}%`),
            ilike(classes.inviteCode, `%${search}%`)
          )
        );
      }
  
      if (subject) {
        filterConditions.push(ilike(subjects.name, `%${subject}%`));
      }
  
      if (teacher) {
        filterConditions.push(ilike(user.name, `%${teacher}%`));
      }
  
      const whereClause =
        filterConditions.length > 0 ? and(...filterConditions) : undefined;
  
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .where(whereClause);
  
      const totalCount = countResult[0]?.count ?? 0;
  
      const classesList = await db
        .select({
          ...getTableColumns(classes),
          subject: {
            ...getTableColumns(subjects),
          },
          teacher: {
            ...getTableColumns(user),
          },
        })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .where(whereClause)
        .orderBy(desc(classes.createdAt))
        .limit(limitPerPage)
        .offset(offset);
  
      return {
        data: classesList,
        pagination: {
          page: currentPage,
          limit: limitPerPage,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitPerPage),
        },
      };
    }
  )
  
  app.get('/:id', 
    {
      schema: {
        summary: 'Listar detalhes da classe',
        tags: ['Classes'],
        params: z.object({
          id: z.string()
        })
      },
      
    }, async (request, reply) => {
      const classId = Number(request.params.id)
      
      if (!Number.isFinite(classId)) return reply.status(400).send({
        error: 'No Class Found'
      })
      
      const [classDetails] = await db
        .select({
          ...getTableColumns(classes),
          subject: {
            ...getTableColumns(subjects),
          },
          department: {
            ...getTableColumns(departments)
          },
          teacher: {
            ...getTableColumns(user)
          }
        })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(eq(classes.id, classId))
      
      if(!classDetails) return reply.status(404).send({
        error: 'No Class Found'
      })
      
      return {
        data: classDetails
      }
    }
  )
}