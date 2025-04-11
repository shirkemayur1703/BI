<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.yourcompany</groupId>
    <artifactId>jira-forge-build</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <build>
        <plugins>
            <!-- Frontend build tasks -->
            <plugin>
                <groupId>com.github.eirslett</groupId>
                <artifactId>frontend-maven-plugin</artifactId>
                <version>1.12.0</version>
                <executions>
                    <!-- Install Node and npm -->
                    <execution>
                        <id>install-node-and-npm</id>
                        <goals>
                            <goal>install-node-and-npm</goal>
                        </goals>
                        <configuration>
                            <nodeVersion>v18.18.2</nodeVersion>
                            <npmVersion>9.8.1</npmVersion>
                        </configuration>
                    </execution>

                    <!-- Install root dependencies -->
                    <execution>
                        <id>npm-install-root</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge</workingDirectory>
                            <arguments>install</arguments>
                        </configuration>
                    </execution>

                    <!-- Install and build main-app -->
                    <execution>
                        <id>npm-install-main-app</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge/main-app</workingDirectory>
                            <arguments>install</arguments>
                        </configuration>
                    </execution>
                    <execution>
                        <id>npm-build-main-app</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge/main-app</workingDirectory>
                            <arguments>run build</arguments>
                        </configuration>
                    </execution>

                    <!-- Install and build modal-app -->
                    <execution>
                        <id>npm-install-modal-app</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge/modal-app</workingDirectory>
                            <arguments>install</arguments>
                        </configuration>
                    </execution>
                    <execution>
                        <id>npm-build-modal-app</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge/modal-app</workingDirectory>
                            <arguments>run build</arguments>
                        </configuration>
                    </execution>

                    <!-- Run Jest tests -->
                    <execution>
                        <id>run-tests</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>test</phase>
                        <configuration>
                            <workingDirectory>src/main/forge/jiraforge</workingDirectory>
                            <arguments>run test</arguments>
                        </configuration>
                    </execution>
                </executions>
            </plugin>

            <!-- Resource packaging -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-resources-plugin</artifactId>
                <version>3.3.1</version>
                <executions>
                    <execution>
                        <id>copy-static-react-builds</id>
                        <phase>package</phase>
                        <goals>
                            <goal>copy-resources</goal>
                        </goals>
                        <configuration>
                            <outputDirectory>${project.build.directory}/forge-dist</outputDirectory>
                            <resources>
                                <resource>
                                    <directory>${project.basedir}/src/main/forge/jiraforge/main-app/build</directory>
                                    <targetPath>static/main-app</targetPath>
                                </resource>
                                <resource>
                                    <directory>${project.basedir}/src/main/forge/jiraforge/modal-app/build</directory>
                                    <targetPath>static/modal-app</targetPath>
                                </resource>
                                <resource>
                                    <directory>${project.basedir}/src/main/forge/jiraforge</directory>
                                    <includes>
                                        <include>index.js</include>
                                        <include>manifest.yml</include>
                                    </includes>
                                    <filtering>false</filtering>
                                </resource>
                            </resources>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
