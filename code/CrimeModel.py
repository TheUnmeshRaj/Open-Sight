# Luohao Xu edsml-lx122 (Edited: Weather & TimeSeries removed)

import mesa
import os
from CrimeAgent import CrimeAgent
from datetime import datetime, timedelta

from DataPreprocessing import DataPreprocessing
import config


def getCrimeNumber(model):
    """Count number of crime events in the current step"""
    return sum(1 for agent in model.schedule.agents if agent.finalDecision)


class CrimeModel(mesa.Model):
    def __init__(self, initialAgents, width, height, initialDate, crimeType):
        """
        Crime agent-based simulation model (simplified & stable)
        """

        self.grid = mesa.space.MultiGrid(width, height, False)
        self.schedule = mesa.time.RandomActivation(self)

        self.datacollector = mesa.DataCollector(
            model_reporters={"crime_number": getCrimeNumber},
            agent_reporters={"agent_crime_prob": "crimeProb"}
        )

        self.population = initialAgents
        self.id = 0
        self.running = True
        self.crimeType = crimeType
        self.date = initialDate
        self.dateCounter = 0
        self.probByDate = 0

        # Initialize agents
        self.addAgentsByLocation(self.population)

        # Load crime dataset once (for baseline statistics)
        projectDir = config.PROJECT_DIR
        dp = DataPreprocessing(projectDir)
        self.avg_daily_crime = max(1, int(len(dp.data) / dp.data["date"].nunique()))

    # --------------------------------------------------
    # Simplified crime count logic (NO Weather / TimeSeries)
    # --------------------------------------------------
    def getCrimeCountByDate(self):
        """
        Returns estimated crime count for the day
        Based on historical average
        """
        return self.avg_daily_crime

    # --------------------------------------------------
    # Random demographic generators
    # --------------------------------------------------
    def getRandomGender(self):
        return 'M' if self.random.randint(1, 100) > 53 else 'F'

    def getRandomAge(self):
        dice = self.random.randint(1, 100)
        if dice < 23:
            return self.random.randint(1, 17)
        elif dice < 30:
            return self.random.randint(18, 24)
        elif dice < 57:
            return self.random.randint(25, 44)
        elif dice < 83:
            return self.random.randint(45, 64)
        else:
            return self.random.randint(65, 80)

    def getRandomRace(self):
        r = self.random.random()
        if r < 0.0058:
            return 'native'
        elif r < 0.1483:
            return 'asian'
        elif r < 0.3821:
            return 'black'
        elif r < 0.7799:
            return 'white'
        else:
            return 'hispanic'

    # --------------------------------------------------
    # Agent placement
    # --------------------------------------------------
    def addAgentsByLocation(self, num):
        for _ in range(num):
            self.id += 1
            crimeHistory = 1 if self.random.randint(1, 10) > 2 else 0

            ag = CrimeAgent(
                self.id,
                self,
                crimeHistory,
                self.getRandomGender(),
                self.getRandomAge(),
                self.getRandomRace(),
                place=self.random.randint(0, 2)
            )

            self.schedule.add(ag)

            x = self.random.randrange(self.grid.width)
            y = self.random.randrange(self.grid.height)
            self.grid.place_agent(ag, (x, y))

    # --------------------------------------------------
    # Simulation step
    # --------------------------------------------------
    def step(self):
        tomorrow = datetime.strptime(self.date, "%Y-%m-%d") + timedelta(days=1)
        self.date = tomorrow.strftime('%Y-%m-%d')
        self.dateCounter += 1

        # Crime probability derived from baseline
        self.crimePredCounts = self.getCrimeCountByDate()
        self.probByDate = self.crimePredCounts / (self.population * 10)

        self.datacollector.collect(self)
        self.schedule.step()

        print(f"Crime events today: {getCrimeNumber(self)}")

        df = self.datacollector.get_model_vars_dataframe()

        outdir = os.path.join(config.PROJECT_DIR, "Outputs")
        os.makedirs(outdir, exist_ok=True)
        df.to_csv(os.path.join(outdir, "simulation_results.csv"))