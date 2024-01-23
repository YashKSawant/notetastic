import { v } from "convex/values";

import { mutation,query} from "./_generated/server"
import {Doc,Id} from "./_generated/dataModel"


/**
 * @description This method is used to archive the note
 */
export const archive = mutation({
    args:{
        id: v.id("documents")
    },
    handler:async (context, args) => {
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");
        
        const userId = identity.subject;
        const currentDoc = await context.db.get(args.id);

        if(!currentDoc)
            throw new Error("Not found!");
        
        if(currentDoc.userId !== userId){
            throw new Error("Unauthorized");
        }

        /**
         * @description This function is used to recursive archive the child document 
         * in parent when parent is archived
         * @param documentId 
         */
        const recursiveChildArchive = async (documentId:Id<"documents">) => {
            const children = await context.db
                .query("documents")
                .withIndex("by_user_parent",(q)=>(
                    q
                    .eq("userId",userId)
                    .eq("parentDocument",documentId)
                ))
                .collect();
            
            for(const child of children){
                await context.db.patch(child._id,{
                    isArchived:true
                })
                await recursiveChildArchive(child._id)
            }
        }

        const document = await context.db.patch(args.id,{
            isArchived: true
        });
        
        recursiveChildArchive(args.id);
        return document;
    }

})

/** 
 * @description This method is used to get sidebar with docs
*/
export const getSidebar = query({
    args:{
        parentDocument:v.optional(v.id("documents"))
    },
    handler:async(context,args)=>{
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");
        
        const userId = identity.subject;
        const documents = await context.db
        .query("documents")
        .withIndex("by_user_parent", (q)=>q
        .eq("userId",userId)
        .eq("parentDocument",args.parentDocument))
        .filter((q)=> 
            q.eq(q.field("isArchived"),false)
        )
        .order("desc")
        .collect()

        return documents;
    }
})

/**
 * @description This method is used to create note
 */
export const create = mutation({
    args:{
        title:v.string(),
        parentDocument:v.optional(v.id("documents")),
    },
    handler:async(context,args)=>{
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");
        
        const userId = identity.subject;
        const document = await context.db.insert("documents",{
            title:args.title,
            parentDocument: args.parentDocument,
            isArchived:false,
            isPublished: false,
            userId
        });
        return document;
    }
})

/**
 * @description This method is used to get archived notes
 */
export const getTrash = query({
    handler:async(context) =>{
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");

        const userId = identity.subject;
        const documents = await context.db
            .query("documents")
            .withIndex("by_user",(q)=>q.eq("userId",userId))
            .filter((q)=> 
            q.eq(q.field("isArchived"),true)
        )
        .order("desc")
        .collect();

        return documents;
    },
})

/**
 * @description This method is used to restore archived notes
 */
export const restore = mutation({
    args:{
        id: v.id("documents")
    },
    handler:async(context, args) =>{
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");
    
        const userId = identity.subject;
        
        const currentDoc = await context.db.get(args.id);

        if(!currentDoc)
            throw new Error("Not found");

        if(currentDoc.userId!== userId){
            throw new Error("Unauthorized");
        }

        const recursiveRestore =async (documentId:Id<"documents">) => {
            const children = await context.db
            .query("documents")
            .withIndex("by_user_parent",(q)=>(
                q
                .eq("userId",userId)
                .eq("parentDocument",documentId)
            ))
            .collect();

            for(const child of children){
                await context.db.patch(child._id,{
                    isArchived:false
                });
                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"documents">>= {
            isArchived: false,
        }

        if(currentDoc.parentDocument){
            const parentDoc = await context.db.get(currentDoc.parentDocument);
            if(parentDoc?.isArchived){
                options.parentDocument = undefined;
            }
        }
        const document = await context.db.patch(args.id,options);

        recursiveRestore(args.id);

        return document;
    },
});

/**
 * @description This method is used to remove notes permanently
 */
export const remove = mutation({
    args:{
        id:v.id("documents")
    },
    handler:async (context,args) => {
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");
    
        const userId = identity.subject;

        const currentDoc = await context.db.get(args.id);

        if(!currentDoc)
            throw new Error("Not found");

        if(currentDoc.userId!== userId){
            throw new Error("Unauthorized");
        }
        const document = await context.db.delete(args.id)

        return document;
    }
})

/**
 * @description This method is used to get searched notes
 */
export const getSearch = query({
    handler:async(context) =>{
        const identity = await context.auth.getUserIdentity()
        if(!identity)
            throw new Error("Not authenticated");

        const userId = identity.subject;

        const documents = await context.db
        .query("documents")
        .withIndex("by_user",(q)=>q.eq("userId",userId))
        .filter((q)=>
            q.eq(q.field("isArchived"),false),
        )
        .order("desc")
        .collect()

        return documents;
    }
})

/**
 * @description This method is used to get notes by ID
 */
export const getById = query({
    args:{
        documentId:v.id("documents")
    },
    handler:async (context, args) =>{
        
        const document = await context.db.get(args.documentId);

        if(document?.isPublished){
            return document;
        }

        const identity = await context.auth.getUserIdentity();
        if(!identity)
            throw new Error("Not authenticated");

        if(!document){
            throw new Error("Not found!");
        }
        if(document.isPublished && !document.isArchived){
            return document;
        }

        const userId = identity.subject;

        if(document.userId!==userId){
            throw new Error("Unauthorized!")
        }
        
        return document;
    },
})

/**
 * @description This method is used to update note
 */
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean())
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const currentDoc = await context.db.get(id);

    if (!currentDoc) {
      throw new Error("Not found");
    }

    if (currentDoc.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await context.db.patch(id, {
      ...rest,
    });

    return document;
  },
});

/**
 * @description This method is used to remove icon
 */
export const removeIcon = mutation({
    args:{
        id: v.id("documents")
    },
    handler: async (context, args)=>{
        const identity = await context.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const currentDoc = await context.db.get(args.id);

        if(!currentDoc){
            throw new Error("Not found");
        }

        if(currentDoc.userId !== userId){
            throw new Error("Unauthorized!")
        }
        
        const document = await context.db.patch(args.id,{
            icon:undefined
        });

         return document;
    }
});

/**
 * @description This method is used to remove cover image of note
 */
export const removeCoverImage = mutation({
    args:{
        id: v.id("documents")
    },
    handler: async (context, args)=>{
        const identity = await context.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const currentDoc = await context.db.get(args.id);

        if(!currentDoc){
            throw new Error("Not found");
        }

        if(currentDoc.userId !== userId){
            throw new Error("Unauthorized!")
        }
        
        const document = await context.db.patch(args.id,{
            coverImage:undefined
        });

         return document;

    }
})
