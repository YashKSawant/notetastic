import { v } from "convex/values";

import { mutation,query} from "./_generated/server"
import {Doc,Id} from "./_generated/dataModel"

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