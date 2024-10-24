"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

import { GetAllSnippetFuncArgs, GetAllSnippetsReturnType, SnippetItemType } from "../types";


interface SnippetFilters {
  isPublic: boolean;
  OR: Array<{
    title?: {
      contains: string;
      mode: 'insensitive';
    };
    description?: {
      contains: string;
      mode: 'insensitive';
    };
  }>;
  language?: string; // Optional language filter
}

export type CreateSnippetType = Prisma.Args<typeof db.snippets, "create">["data"];

export const createSnippetAction = async (snippet: CreateSnippetType) => {

  try {
    await db.snippets.create({ data: snippet });
    revalidatePath("/feed");
  } catch (error: unknown) {
    console.log(error);
    throw new Error(error);
  }
};

export const editSnippetAction = async (id: string, snippet: CreateSnippetType) => {
  try {
    await db.snippets.update({
      where: {
        id
      },
      data: snippet
    });
    revalidatePath("/feed");
    revalidatePath(`snippet/${id}`);
    revalidatePath(`snippet/${id}/edit`);
  } catch (error: unknown) {
    console.log(error);
    throw new Error();
  }
};

export const getAllSnippetsAction = async ({ page, searchText, language, limit = 6}: GetAllSnippetFuncArgs): Promise<GetAllSnippetsReturnType> => {
  try {
    const skipRecords = (page - 1) * limit;

    const filters: SnippetFilters = {
      isPublic: true,
      OR: [
        {
          title: {
            contains: searchText,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: searchText,
            mode: 'insensitive'
          }
        }
      ]
    }

    if(!!language) {
      filters['language'] = language
    } 

    

    const records = await db.$transaction([
        db.snippets.count({
            where: filters,
        }),

        db.snippets.findMany({
            where: filters,
            include: {
              author: {
                select: {
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: "desc",
            },
            skip: skipRecords,
            take: limit,
          })
    ])

    return {
        data: records[1],
        totalPages: Math.ceil(records[0] / limit)
    }

  } catch (err: unknown) {
    console.log(err);
    return {
        data: [],
        totalPages: 0
    }
  }
};

export const getAllSnippetByIdAction = async (id: string): Promise<SnippetItemType | null> => {
  try {
    return await db.snippets.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            name: true,
          }
        }
      }
    });
  } catch (err: unknown) {
    console.log(err);
    return null;
  }
};
