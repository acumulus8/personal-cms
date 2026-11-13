import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { Section, ColumnLayout, ContainerType, SectionType, CreateSectionDocument, UpdateSectionDocument, GetPageDetailDocument, ContentType } from '../../gql/graphql';

const SECTION_TYPES = Object.values(SectionType);
const COLUMN_LAYOUTS = Object.values(ColumnLayout);
const CONTAINER_TYPES = Object.values(ContainerType);
const CONTENT_TYPES = Object.values(ContentType);

interface SectionFormValues {
  name: string;
  type: SectionType;
  order: number;
  columnLayout: ColumnLayout;
  containerType: string;
  parentId: string;
}

interface SectionFormProps {
  open: boolean;
  pageId: number;
  section?: Section | null;
  existingSections: Section[];
  defaultParentId?: number | null;
  onClose: () => void;
}

export function SectionForm({ open, pageId, section, existingSections, defaultParentId, onClose }: SectionFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEdit = !!section;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormValues>();

  const refetchQueries = [{ query: GetPageDetailDocument, variables: { id: pageId } }];
  const [createSection, { error: createError }] = useMutation(CreateSectionDocument, { refetchQueries });
  const [updateSection, { error: updateError }] = useMutation(UpdateSectionDocument, { refetchQueries });
  const mutationError = createError ?? updateError;

  useEffect(() => {
    if (open) {
      reset({
        name: section?.name ?? '',
        type: section?.type as SectionType,
        order: section?.order ?? 0,
        columnLayout: section?.columnLayout ?? '',
        containerType: section?.containerType ?? '',
        parentId: section?.parentId?.toString() ?? defaultParentId?.toString() ?? '',
      });
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open, section, defaultParentId, reset]);

  async function onSubmit(values: SectionFormValues) {
    const input = {
      name: values.name || undefined,
      type: values.type as SectionType,
      order: values.order ? parseInt(values.order, 10) : undefined,
      columnLayout: (values.columnLayout || undefined) as ColumnLayout | undefined,
      containerType: (values.containerType || undefined) as ContainerType | undefined,
      parentId: values.parentId ? parseInt(values.parentId, 10) : undefined,
    };

    if (isEdit && section?.id != null) {
      await updateSection({ variables: { id: section.id, input } });
    } else {
      await createSection({ variables: { input: { ...input, pageId, type: values.type as SectionType } } });
    }
    onClose();
  }

  const parentOptions = existingSections.filter((s) => s.id !== section?.id);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-full max-w-lg">
        <h3 className="font-bold text-lg mb-4">{isEdit ? 'Edit Section' : 'New Section'}</h3>

        {mutationError && (
          <div role="alert" className="alert alert-error mb-4 text-sm">
            <span>{mutationError.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <fieldset className="fieldset col-span-2">
              <legend className="fieldset-legend">Name</legend>
              <input
                type="text"
                className="input input-bordered w-full"
                {...register('name')}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Type *</legend>
              <select
                className={`select select-bordered w-full ${errors.type ? 'select-error' : ''}`}
                {...register('type', { required: 'Type is required' })}
              >
                {SECTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {errors.type && <p className="fieldset-label text-error">{errors.type.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Order</legend>
              <input
                type="number"
                className="input input-bordered w-full"
                {...register('order')}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Column Layout</legend>
              <select className="select select-bordered w-full" {...register('columnLayout')}>
                <option value="">None</option>
                {COLUMN_LAYOUTS.map((l) => (
                  <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Container Type</legend>
              <select className="select select-bordered w-full" {...register('containerType')}>
                <option value="">None</option>
                {CONTAINER_TYPES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </fieldset>

            {parentOptions.length > 0 && (
              <fieldset className="fieldset col-span-2">
                <legend className="fieldset-legend">Parent Section</legend>
                <select className="select select-bordered w-full" {...register('parentId')}>
                  <option value="">None (top-level)</option>
                  {parentOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name ?? `Section #${s.id}`} ({s.type})</option>
                  ))}
                </select>
              </fieldset>
            )}
          </div>

          <div className="modal-action mt-2">
            <form method="dialog">
              <button className="btn btn-ghost mr-2" disabled={isSubmitting}>Cancel</button>
            </form>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : isEdit ? 'Save changes' : 'Create section'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
