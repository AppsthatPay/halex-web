import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager


class TestAgencyManager(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")

    def test_create_agency_success(self):
        res = self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        self.assertEqual(res["status"], "AGENCY_CREATED")
        coverage = self.agency_mgr.verify_coverage("Chain-01")
        self.assertEqual(coverage["status"], "COVERAGE_VERIFIED")

    def test_agency_overlap_refused(self):
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        res = self.agency_mgr.create_agency("ag-02", "Chain-01", "culinary", 500, 1499)
        self.assertEqual(res["status"], "ERROR")
        self.assertEqual(res["reason"], "ADDRESS_RANGE_OVERLAP")

    def test_remove_agency_refused_with_records(self):
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        self.agency_mgr.assign_record_to_agency("ag-01", "rec-01")
        res = self.agency_mgr.remove_agency("ag-01")
        self.assertEqual(res["status"], "REFUSED")

    def test_addresses_used_is_records_not_ranges(self):
        # Gate probe for the original bug: ranges sum to 1000, records to 0.
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        chain = self.registry.get_chain("Chain-01")["chain"]
        self.assertEqual(chain["addresses_reserved"], 1000)
        self.assertEqual(chain["addresses_used"], 0)


if __name__ == "__main__":
    unittest.main()
