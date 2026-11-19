import { GraphQLError } from 'graphql';
import { builder } from '../builder';
import { prisma } from '@/prisma';

builder.prismaObject('SectionContentItem', {
    fields: (t) => ({
        sectionId: t.exposeInt('sectionId'),
        contentId: t.exposeInt('contentId'),
        order: t.exposeInt('order'),
        section: t.relation('section'),
        content: t.relation('content'),
    }),
});

builder.queryField('sectionContentItems', (t) =>
    t.prismaField({
        type: ['SectionContentItem'],
        args: { sectionId: t.arg.int({ required: false }) },
        resolve: (query, _root, args) =>
            prisma.sectionContentItem.findMany({
                ...query,
                ...(args.sectionId ? { where: { sectionId: args.sectionId } } : {}),
                orderBy: { order: 'asc' },
            }),
    })
);

const AddSectionContentItemInput = builder.inputType('AddSectionContentItemInput', {
    fields: (t) => ({
        sectionId: t.int({ required: true }),
        contentId: t.int({ required: true }),
        order: t.int({ required: false }),
    }),
});

builder.mutationField('addSectionContentItem', (t) =>
    t.prismaField({
        type: 'SectionContentItem',
        args: { input: t.arg({ type: AddSectionContentItemInput, required: true }) },
        resolve: (query, _root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
            const { sectionId, contentId, order } = args.input;
            return prisma.sectionContentItem.create({
                ...query,
                data: { sectionId, contentId, order: order ?? 0 },
            });
        },
    })
);

builder.mutationField('updateSectionContentItemOrder', (t) =>
    t.prismaField({
        type: 'SectionContentItem',
        args: {
            sectionId: t.arg.int({ required: true }),
            contentId: t.arg.int({ required: true }),
            order: t.arg.int({ required: true }),
        },
        resolve: (query, _root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
            return prisma.sectionContentItem.update({
                ...query,
                where: { sectionId_contentId: { sectionId: args.sectionId, contentId: args.contentId } },
                data: { order: args.order },
            });
        },
    })
);

builder.mutationField('removeSectionContentItem', (t) =>
    t.prismaField({
        type: 'SectionContentItem',
        args: {
            sectionId: t.arg.int({ required: true }),
            contentId: t.arg.int({ required: true }),
        },
        resolve: (query, _root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
            return prisma.sectionContentItem.delete({
                ...query,
                where: { sectionId_contentId: { sectionId: args.sectionId, contentId: args.contentId } },
            });
        },
    })
);
