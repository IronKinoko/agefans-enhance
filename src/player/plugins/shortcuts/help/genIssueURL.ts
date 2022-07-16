export function genIssueURL({ title, body }: { title: string; body: string }) {
  const url = new URL(
    `https://github.com/IronKinoko/agefans-enhance/issues/new`
  )
  url.searchParams.set('title', title)
  url.searchParams.set('body', body)
  return url.toString()
}
