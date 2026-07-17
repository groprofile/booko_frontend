export function submitPayuForm(payuParams: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payuParams["url"] ?? "https://test.payu.in/_payment";
  const skip = new Set(["url"]);
  Object.entries(payuParams).forEach(([key, value]) => {
    if (skip.has(key) || typeof value !== "string") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
