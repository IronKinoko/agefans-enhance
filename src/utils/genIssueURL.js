export function genIssueURL({ title, body }) {
  const url = new URL(
    `https://github.com/IronKinoko/agefans-enhance/issues/new`
  )
  url.searchParams.set('title', title)
  url.searchParams.set('body', body)
  return url.toString()
}
