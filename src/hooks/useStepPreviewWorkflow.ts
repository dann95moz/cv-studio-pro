import { useStepPreviewFacade } from './facades/useStepPreviewFacade';

/**
 * Backward compatibility adapter for useStepPreviewWorkflow.
 * Delegates all state, hooks, and domain logic to the unified useStepPreviewFacade.
 */
export const useStepPreviewWorkflow = () => {
  const facade = useStepPreviewFacade();

  return {
    // Canvas domain
    ...facade.canvas,
    // Design domain
    ...facade.design,
    // Exports domain
    ...facade.exports,
    // Modals domain
    ...facade.modals,
    // Translation domain
    ...facade.translation,
    // Versions domain
    ...facade.versions,
    // Meta domain
    ...facade.meta,
    // Document type
    previewDocType: facade.docType.previewDocType,
    setPreviewDocType: facade.docType.setPreviewDocType,
  };
};
