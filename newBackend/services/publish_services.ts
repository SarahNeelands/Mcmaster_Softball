import * as repo from "../repo/publish_repo";

export async function Publish() 
{
    const publish = await repo.PublishAll();
    const deleted =  await repo.DeleteAll();
    return;
}