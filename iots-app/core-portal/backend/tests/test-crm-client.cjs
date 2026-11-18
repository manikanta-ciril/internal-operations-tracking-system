const { test } = require("node:test");
const assert = require("node:assert/strict");
const { crmUrl, fetchCrm } = require("../src/crm/client");
const environment = { CRM_API_BASE_URL: "https://crm.example/api/integration/v1", CRM_API_TOKEN: "test-secret" };

test("validates filters and keeps credentials server side", async () => {
  assert.equal(crmUrl("leads", { per_page: "25" }, environment).pathname, "/api/integration/v1/leads");
  for (const query of [{per_page:"101"}, {page:"0"}, {from:"2026-02-30"}, {from:"2026-11-18",to:"2026-11-01"}, {token:"secret"}]) {
    assert.throws(() => crmUrl("leads", query, environment), { status:400 });
  }
  assert.throws(() => crmUrl("leads", {}, {...environment,CRM_API_BASE_URL:"http://crm.example"}), {status:503});
  const result = await fetchCrm("leads", {}, {environment, fetcher: async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-secret");
    assert.equal(options.redirect, "error");
    return {ok:true,json:async()=>({data:[{id:1}],meta:{total:1}})};
  }});
  assert.deepEqual(result.data,[{id:1}]);
  assert(!JSON.stringify(result).includes("test-secret"));
});
test("handles upstream rejection and invalid JSON without leaking upstream secrets", async () => {
  await assert.rejects(fetchCrm("leads", {}, {environment,fetcher:async()=>({ok:false,status:401})}), {status:502});
  await assert.rejects(fetchCrm("leads", {}, {environment,fetcher:async()=>({ok:true,json:async()=>({unexpected:true})})}), {status:502});
  await assert.rejects(fetchCrm("leads", {}, {environment,fetcher:async()=>{throw Error("secret");}}), {status:502});
});
test("role denial prevents CRM requests", async () => {
  const endpoints = {};
  require("../src/crm/routes")({get:(path,handler)=>endpoints[path]=handler}, {pool:{execute:async()=>[[{role_code:"it-system-analyst"}]]}});
  let status;
  const res={set(){},status(value){status=value;return this;},json(value){assert.match(value.message,/role/);}};
  await endpoints["/api/auth/crm/leads"]({session:{employee_id:"employee"},params:{},query:{}},res);
  assert.equal(status,403);
});
