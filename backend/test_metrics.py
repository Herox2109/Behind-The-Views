import unittest
from .main import get_metrics, get_posts, SimulationRequest, simulate_channel


class DatasetTests(unittest.TestCase):
    def test_metrics_match_posts_and_simulation(self):
        posts = get_posts()["posts"]
        metrics = get_metrics()
        self.assertEqual(sum(p["likes"] for p in posts), metrics["total_likes"])
        self.assertEqual(metrics["total_likes"], 294111)
        self.assertEqual(metrics["before_break_median_ex_viral"], 153)
        self.assertEqual(metrics["after_break_median"], 46)
        self.assertEqual(SimulationRequest().baseline_median_likes, 153)
        simulation = simulate_channel(SimulationRequest())
        self.assertEqual(simulation["projected_lifetime_likes"] - simulation["estimated_additional_likes"], metrics["total_likes"])
