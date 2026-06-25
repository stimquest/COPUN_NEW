import { getMyTemplates } from '@/actions/template-actions';
import { NewStageClient } from './NewStageClient';

export default async function NewStagePage() {
    const templates = await getMyTemplates();
    return <NewStageClient templates={templates} />;
}
