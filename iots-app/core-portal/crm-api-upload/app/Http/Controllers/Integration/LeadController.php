<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    private const FIELDS = [
        'id', 'lead_status', 'leadStatus', 'negotiation_status_id',
        'assigned_to', 'assigned_orgid', 'assigned_user_id', 'user_id',
        'assigned_date', 'created_at', 'updated_at',
    ];

    public function index(Request $request)
    {
        $filters = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'status' => 'sometimes|integer|min:0',
            'from' => 'sometimes|date_format:Y-m-d',
            'to' => 'sometimes|date_format:Y-m-d' . ($request->filled('from') ? '|after_or_equal:from' : ''),
        ]);
        $query = Lead::query()->select(self::FIELDS);
        if (isset($filters['status'])) $query->where('lead_status', $filters['status']);
        if (isset($filters['from'])) $query->where('created_at', '>=', $filters['from'] . ' 00:00:00');
        if (isset($filters['to'])) $query->where('created_at', '<', date('Y-m-d', strtotime($filters['to'] . ' +1 day')) . ' 00:00:00');
        $page = $query->orderByDesc('id')->paginate($filters['per_page'] ?? 25);
        return response()->json([
            'data' => $this->enrich($page->items(), false),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total()],
            'source' => 'CIRIL CRM', 'fetched_at' => now()->toIso8601String(),
        ]);
    }

    public function show($id)
    {
        $lead = Lead::query()->select(self::FIELDS)->findOrFail($id);
        return response()->json(['data' => $this->enrich([$lead], true)[0], 'source' => 'CIRIL CRM', 'fetched_at' => now()->toIso8601String()]);
    }

    private function enrich(array $leads, bool $detail): array
    {
        $ids = array_map(function ($lead) { return $lead->id; }, $leads);
        if (!$ids) return [];
        $users = DB::table('users')->select('id','name','orgId','email','phoneNumber','designation')->get()->keyBy('id');
        $companies = DB::table('company')->select('id','companyName','name')->get()->keyBy('id');
        $statuses = DB::table('lead_status_types')->pluck('statu_type','id');
        $negotiations = DB::table('negotiation_statuses')->pluck('negotiation_status','id');
        $children = [];
        $tables = $detail
            ? ['client_details','requirements_details','financial_details','brokerage','payments','lead_assigns','lead_remarks_histrory','proposels','lead_statuses']
            : ['client_details'];
        foreach ($tables as $table) {
            $children[$table] = DB::table($table)->whereIn('lead_id', $ids)->get()->groupBy('lead_id');
        }
        return array_map(function ($lead) use ($users,$companies,$statuses,$negotiations,$children,$detail) {
            $record = $lead->toArray();
            $record['status'] = $statuses[$lead->leadStatus] ?? 'Status not mapped';
            $record['negotiation'] = $negotiations[$lead->negotiation_status_id] ?? null;
            $record['assigned_user'] = $users[$lead->assigned_user_id] ?? null;
            $record['created_by'] = $users[$lead->user_id] ?? null;
            $record['organisation'] = $companies[$lead->assigned_orgid] ?? null;
            foreach ($children as $table => $rows) {
                $record[$table] = ($rows[$lead->id] ?? collect())->values()->all();
            }
            return $record;
        }, $leads);
    }

    public function resources(Request $request, $resource = null)
    {
        $catalog = config('integration_resources');
        if ($resource === null) return response()->json(['data'=>array_keys($catalog),'source'=>'CIRIL CRM']);
        abort_unless(isset($catalog[$resource]),404);
        $filters=$request->validate(['page'=>'sometimes|integer|min:1','per_page'=>'sometimes|integer|min:1|max:100']);
        $columns=$catalog[$resource];
        $page=DB::table($resource)->select($columns)->orderBy($columns[0])->paginate($filters['per_page'] ?? 25);
        return response()->json(['data'=>$page->items(),'meta'=>['current_page'=>$page->currentPage(),'last_page'=>$page->lastPage(),'per_page'=>$page->perPage(),'total'=>$page->total()],'source'=>'CIRIL CRM','fetched_at'=>now()->toIso8601String()]);
    }
}
