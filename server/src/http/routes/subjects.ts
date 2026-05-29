import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from 'zod'
import { departments, subjects } from "../../db/schema";
import { db } from "../../db";

export const subjectsRoutes: FastifyPluginAsyncZod = async app => {
  app.get('/',
    {
      schema: {
        summary: 'Listar matérias',
        tags: ['Subjects'],
        querystring: z.object({
          search: z.string().optional(),
          department: z.string().optional(),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
        }),
      },
    }, async (request, reply) => {
      const { search, department, page = 1, limit = 10} = request.query
      
      const currentPage = Math.max(1, +page)
      const limitPerPage = Math.max(1, +limit)
      
      const offset = (currentPage - 1) * limitPerPage
      
      const filterConditions = []
      
      if ( search ) {
        filterConditions.push(
          or(
            ilike(subjects.name, `%${search}`),
            ilike(subjects.code, `%${search}`)
          )
        )
      }
      
      if (department) {
        filterConditions.push(ilike(departments.name, `%${department}`))
      }
      
      const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined
      
      const countResult = await db
        .select({ count: sql<number> `count(*)`})
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
      
      const totalCount = countResult[0]?.count ?? 0
      
      const subjectList = await db
        .select({
          ...getTableColumns(subjects),
          department: { ...getTableColumns(departments) },
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .orderBy(desc(subjects.createdAt))
        .limit(limitPerPage)
        .offset(offset)
      
      return {
        data: subjectList,
        pagination: {
          page: currentPage,
          limit: limitPerPage,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitPerPage)
        }
      }
    }
  )
}

