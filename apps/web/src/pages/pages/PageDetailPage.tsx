import { Fragment, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetPageDetailDocument, DeletePageDocument, DeleteSectionDocument } from '../../gql/graphql';
import type { Section } from '../../gql/graphql';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { SectionForm } from './SectionForm';

export function PageDetailPage() {
  const {id} = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageId = parseInt(id!, 10);

  const {data, loading} = useQuery(GetPageDetailDocument, {
    variables: {id: pageId},
  });

  const page = data?.page;

  const [deletePage, {loading: deleting}] = useMutation(DeletePageDocument, {
    onCompleted: () => navigate('/sites'),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);

  // Section CRUD state
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);
  const [sectionFormDefaultParentId, setSectionFormDefaultParentId] = useState<number | null>(null);

  const [deleteSection, { loading: deletingSection }] = useMutation(DeleteSectionDocument, {
    refetchQueries: [{ query: GetPageDetailDocument, variables: { id: pageId } }],
  });

  async function handleDelete() {
    if (page?.id == null) return;
    await deletePage({ variables: { id: page.id } });
  }

  async function handleDeleteSection() {
    if (deletingSectionId == null) return;
    await deleteSection({ variables: { id: deletingSectionId } });
    setDeletingSectionId(null);
  }

  function openCreateSection() {
    setEditingSection(null);
    setSectionFormDefaultParentId(null);
    setSectionFormOpen(true);
  }

  function openCreateSubSection(parentId: number) {
    setEditingSection(null);
    setSectionFormDefaultParentId(parentId);
    setSectionFormOpen(true);
  }

  function openEditSection(section: Section) {
    setEditingSection(section);
    setSectionFormDefaultParentId(null);
    setSectionFormOpen(true);
  }

  if (loading) {
    return (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-8 w-64"/>
          <div className="skeleton h-40 w-full"/>
          <div className="skeleton h-56 w-full"/>
        </div>
    );
  }

  if (!page) {
    return (
        <div className="flex flex-col gap-6">
          <div className="alert alert-error">
            <span>Page not found.</span>
          </div>
        </div>
    );
  }


  const site = page.site;
  const mobileApp = page.mobileApp;
  const subPages = page.subPages ?? [];
  const sections = (page.sections ?? []) as Section[];
  const topLevelSections = sections.filter((s) => s.parentId == null);

  return (
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs">
          <ul>
            <li><Link to="/pages">Pages</Link></li>
            <li>{page.title}</li>
          </ul>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl font-bold">{page.title}</h1>
            <p className="text-sm text-base-content/50 font-mono mt-0.5"><span className="text-xs text-base-content/40">Slug: </span>{page.slug}</p>
            <p className="text-sm text-base-content/50 font-mono mt-0.5"><span className="text-xs text-base-content/40">Site: </span>{site.name}</p>
          </div>
          <div className="h-full flex flex-col gap-2">
            <button className="btn btn-sm btn-error btn-outline mb-28" onClick={() => setDeleteOpen(true)}>Delete</button>
            <Link to={`/sites/${site.id}`} className="link link-primary">Back To Site</Link>
          </div>
        </div>

        {/* Page details + Site info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Page details */}
          <div className="card bg-base-100 shadow lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title text-base">Page Details</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-2">
                <div>
                  <dt className="text-base-content/50 font-medium">Title</dt>
                  <dd className="font-mono mt-0.5">{page.title}</dd>
                </div>
                <div>
                  <dt className="text-base-content/50 font-medium">Slug</dt>
                  <dd className="font-mono mt-0.5">{page.slug}</dd>
                </div>
                <div>
                  <dt className="text-base-content/50 font-medium">Created</dt>
                  <dd className="mt-0.5">{page.createdAt ? new Date(page.createdAt).toLocaleDateString() : '—'}</dd>
                </div>
                <div>
                  <dt className="text-base-content/50 font-medium">Last Updated</dt>
                  <dd className="mt-0.5">{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Site / Mobile App info */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title text-base">{site ? 'Site' : mobileApp ? 'Mobile App' : 'Site'}</h2>
              {site ? (
                  <dl className="flex flex-col gap-2 text-sm mt-2">
                    <div>
                      <dt className="text-base-content/50 font-medium">Name</dt>
                      <dd className="font-semibold mt-0.5">{site.name}</dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Domain</dt>
                      <dd className="font-mono text-xs mt-0.5">{site.domain ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Host</dt>
                      <dd className="font-mono text-xs mt-0.5">{site.host ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Type</dt>
                      <dd className="mt-0.5">
                        <span className="badge badge-outline badge-sm">{site.type ?? '—'}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Slug</dt>
                      <dd className="font-mono text-xs mt-0.5 text-base-content/70">{site.slug ?? '—'}</dd>
                    </div>
                  </dl>
              ) : mobileApp ? (
                  <dl className="flex flex-col gap-2 text-sm mt-2">
                    <div>
                      <dt className="text-base-content/50 font-medium">Name</dt>
                      <dd className="font-semibold mt-0.5">{mobileApp.name}</dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Type</dt>
                      <dd className="mt-0.5">
                        <span className="badge badge-outline badge-sm">{mobileApp.type ?? '—'}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-base-content/50 font-medium">Description</dt>
                      <dd className="mt-0.5 text-base-content/70">{mobileApp.description ?? '—'}</dd>
                    </div>
                  </dl>
              ) : (
                  <p className="text-sm text-base-content/50 mt-2">No site or app linked.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Sections</h2>
              <button className="btn btn-sm btn-primary btn-outline" onClick={openCreateSection}>
                + Add Section
              </button>
            </div>
            {topLevelSections.length > 0 ? (
                <div className="overflow-x-auto mt-2">
                  <table className="table table-sm w-full">
                    <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Order</th>
                      <th>Column Layout</th>
                      <th>Container</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {topLevelSections.map((section) => (
                        <Fragment key={section.id}>
                          <tr className="hover">
                            <td className="font-medium">{section.name ?? <span className="text-base-content/30 italic">Unnamed</span>}</td>
                            <td><span className="badge badge-outline badge-sm">{section.type}</span></td>
                            <td className="text-base-content/60">{section.order ?? '—'}</td>
                            <td className="text-base-content/60 text-xs">{section.columnLayout?.replace(/_/g, ' ') ?? '—'}</td>
                            <td className="text-base-content/60 text-xs">{section.containerType ?? '—'}</td>
                            <td className="text-right">
                              <div className="flex gap-1 justify-end">
                                <button
                                    className="btn btn-xs btn-ghost"
                                    onClick={() => openCreateSubSection(section.id!)}
                                >
                                  + Sub-section
                                </button>
                                <button
                                    className="btn btn-xs btn-ghost"
                                    onClick={() => openEditSection(section)}
                                >
                                  Edit
                                </button>
                                <button
                                    className="btn btn-xs btn-error btn-ghost"
                                    onClick={() => setDeletingSectionId(section.id!)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {(section.subSections ?? []).map((sub) => (
                              <tr key={sub.id} className="hover bg-base-200/40">
                                <td className="pl-8 font-medium text-base-content/70">
                                  <span className="text-base-content/30 mr-1">↳</span>
                                  {sub.name ?? <span className="text-base-content/30 italic">Unnamed</span>}
                                </td>
                                <td><span className="badge badge-outline badge-sm badge-ghost">{sub.type}</span></td>
                                <td className="text-base-content/60">{sub.order ?? '—'}</td>
                                <td className="text-base-content/60 text-xs">{sub.columnLayout?.replace(/_/g, ' ') ?? '—'}</td>
                                <td className="text-base-content/60 text-xs">{sub.containerType ?? '—'}</td>
                                <td className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <button
                                        className="btn btn-xs btn-ghost"
                                        onClick={() => openEditSection(sub as Section)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                        className="btn btn-xs btn-error btn-ghost"
                                        onClick={() => setDeletingSectionId(sub.id!)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                        </Fragment>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : (
                <p className="text-sm text-base-content/50 mt-2">No sections yet.</p>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">SEO</h2>
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-2">
              <div>
                <dt className="text-base-content/50 font-medium">Meta Title</dt>
                <dd className="mt-0.5">{page.metaTitle ?? <span className="text-base-content/30 italic">Not set</span>}</dd>
              </div>
              <div>
                <dt className="text-base-content/50 font-medium">Keywords</dt>
                <dd className="mt-0.5">{page.keywords ?? <span className="text-base-content/30 italic">Not set</span>}</dd>
              </div>
              <div className="lg:col-span-2">
                <dt className="text-base-content/50 font-medium">Meta Description</dt>
                <dd className="mt-0.5">{page.metaDescription ?? <span className="text-base-content/30 italic">Not set</span>}</dd>
              </div>
              {page.ogImage && (
                  <div className="lg:col-span-2">
                    <dt className="text-base-content/50 font-medium">OG Image</dt>
                    <dd className="font-mono text-xs mt-0.5 break-all">{page.ogImage}</dd>
                  </div>
              )}
            </dl>
          </div>
        </div>

        {/* Sub-pages */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-base">Sub-pages</h2>
            {subPages.length > 0 ? (
                <ul className="mt-2 divide-y divide-base-200">
                  {subPages.map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between py-2 text-sm">
                        <Link to={`/pages/${sub.id}`} className="link link-primary font-medium">
                          {sub.title}
                        </Link>
                        <span className="font-mono text-xs text-base-content/50">{sub.slug}</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <p className="text-sm text-base-content/50 mt-2">No sub-pages.</p>
            )}
          </div>
        </div>

        <ConfirmDeleteModal
            open={deleteOpen}
            itemName={page.title ?? ''}
            loading={deleting}
            onConfirm={handleDelete}
            onClose={() => setDeleteOpen(false)}
        />

        <SectionForm
            open={sectionFormOpen}
            pageId={pageId}
            section={editingSection}
            existingSections={sections}
            defaultParentId={sectionFormDefaultParentId}
            onClose={() => setSectionFormOpen(false)}
        />

        <ConfirmDeleteModal
            open={deletingSectionId != null}
            itemName={
              sections.find((s) => s.id === deletingSectionId)?.name ??
              sections.flatMap((s) => s.subSections ?? []).find((s) => s.id === deletingSectionId)?.name ??
              `Section #${deletingSectionId}`
            }
            loading={deletingSection}
            onConfirm={handleDeleteSection}
            onClose={() => setDeletingSectionId(null)}
        />
      </div>
  );
}
