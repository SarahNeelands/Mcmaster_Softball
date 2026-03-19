import * as repo from "../repo/publish_repo";

export async function Publish() 
{
    await repo.PublishAll();
    await repo.DeleteAll();
    return;
}

export async function Revert()
{
    await repo.RevertAll();
    return;
}
